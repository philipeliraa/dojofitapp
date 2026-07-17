package com.dojofit.api.service;

import com.dojofit.api.config.JwtUtil;
import com.dojofit.api.dto.request.GoogleAuthRequest;
import com.dojofit.api.dto.request.LoginRequest;
import com.dojofit.api.dto.request.RegisterRequest;
import com.dojofit.api.dto.response.UserResponse;
import com.dojofit.api.exception.AuthException;
import com.dojofit.api.exception.BusinessException;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final ConviteService conviteService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;

    @Value("${google.client-id}")
    private String googleClientId;

    /**
     * Cadastro exige convite válido: e-mail e papel vêm do convite, nunca do
     * cliente (docs/02 seção 5, docs/06 fluxo 2).
     */
    @Transactional
    public AuthSession register(RegisterRequest request) {
        var convite = conviteService.validar(request.conviteToken());

        if (usuarioRepository.findByEmail(convite.getEmail()).isPresent()) {
            throw new BusinessException("Email ja cadastrado. Faca login");
        }

        var usuario = new Usuario();
        usuario.setNome(request.nome());
        usuario.setEmail(convite.getEmail());
        usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
        usuario.setRole(convite.getRole());
        usuarioRepository.save(usuario);

        conviteService.marcarUsado(convite);

        return sessionFor(usuario);
    }

    public AuthSession login(LoginRequest request) {
        var usuario = usuarioRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException("Email ou senha invalidos"));

        if (usuario.getSenhaHash() == null || !passwordEncoder.matches(request.senha(), usuario.getSenhaHash())) {
            throw new BusinessException("Email ou senha invalidos");
        }

        if (!usuario.getAtivo()) {
            throw new BusinessException("Usuario inativo");
        }

        return sessionFor(usuario);
    }

    public AuthSession loginWithGoogle(GoogleAuthRequest request) {
        try {
            // Verify Google ID token via Google's tokeninfo endpoint
            var httpClient = HttpClient.newHttpClient();
            var httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://oauth2.googleapis.com/tokeninfo?id_token=" + request.idToken()))
                    .GET()
                    .build();

            var response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                throw new BusinessException("Token Google invalido");
            }

            JsonNode payload = objectMapper.readTree(response.body());
            String googleId = payload.get("sub").asText();
            String email = payload.get("email").asText();
            String nome = payload.has("name") ? payload.get("name").asText() : email;

            // Verify audience matches our client ID
            String aud = payload.get("aud").asText();
            if (!googleClientId.isEmpty() && !googleClientId.equals(aud)) {
                throw new BusinessException("Token Google invalido para este aplicativo");
            }

            var usuario = resolveGoogleUser(googleId, email, nome);

            if (!usuario.getAtivo()) {
                throw new BusinessException("Usuario inativo");
            }

            return sessionFor(usuario);

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("Erro ao autenticar com Google");
        }
    }

    /**
     * Conta nova via Google só com convite pendente — papel vem do convite,
     * nunca é autodeclarado (docs/02, docs/06). Contas existentes apenas
     * ganham o vínculo com o googleId.
     */
    @Transactional
    Usuario resolveGoogleUser(String googleId, String email, String nome) {
        var existente = usuarioRepository.findByGoogleId(googleId)
                .or(() -> usuarioRepository.findByEmail(email));

        Usuario usuario;
        if (existente.isPresent()) {
            usuario = existente.get();
        } else {
            var convite = conviteService.buscarPendentePorEmail(email)
                    .orElseThrow(() -> new BusinessException("Acesso ao Dojofit requer convite da academia"));
            usuario = new Usuario();
            usuario.setNome(nome);
            usuario.setRole(convite.getRole());
            conviteService.marcarUsado(convite);
        }

        usuario.setGoogleId(googleId);
        usuario.setEmail(email);
        usuarioRepository.save(usuario);
        return usuario;
    }

    /**
     * Renova a sessão a partir do refresh token do cookie httpOnly (docs/07 seção 7).
     * Também rotaciona o refresh token — cada uso emite um novo cookie.
     */
    public AuthSession refresh(String refreshToken) {
        if (refreshToken == null || !jwtUtil.validateToken(refreshToken)
                || !JwtUtil.TYPE_REFRESH.equals(jwtUtil.extractTokenType(refreshToken))) {
            throw new AuthException("Sessao expirada. Faca login novamente");
        }

        Long userId = jwtUtil.extractUserId(refreshToken);
        var usuario = usuarioRepository.findById(userId)
                .filter(Usuario::getAtivo)
                .orElseThrow(() -> new AuthException("Sessao expirada. Faca login novamente"));

        return sessionFor(usuario);
    }

    private AuthSession sessionFor(Usuario usuario) {
        return new AuthSession(
                jwtUtil.generateToken(usuario),
                jwtUtil.generateRefreshToken(usuario),
                UserResponse.from(usuario));
    }
}
