package com.dojofit.api.service;

import com.dojofit.api.config.JwtUtil;
import com.dojofit.api.dto.request.GoogleAuthRequest;
import com.dojofit.api.dto.request.LoginRequest;
import com.dojofit.api.dto.request.RegisterRequest;
import com.dojofit.api.dto.response.AuthResponse;
import com.dojofit.api.dto.response.UserResponse;
import com.dojofit.api.exception.BusinessException;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.model.enums.Role;
import com.dojofit.api.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;

    @Value("${google.client-id}")
    private String googleClientId;

    public AuthResponse register(RegisterRequest request) {
        if (usuarioRepository.findByEmail(request.email()).isPresent()) {
            throw new BusinessException("Email ja cadastrado");
        }

        var usuario = new Usuario();
        usuario.setNome(request.nome());
        usuario.setEmail(request.email());
        usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
        usuario.setRole(Role.ALUNO);
        usuarioRepository.save(usuario);

        String token = jwtUtil.generateToken(usuario);
        return new AuthResponse(token, UserResponse.from(usuario));
    }

    public AuthResponse login(LoginRequest request) {
        var usuario = usuarioRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException("Email ou senha invalidos"));

        if (usuario.getSenhaHash() == null || !passwordEncoder.matches(request.senha(), usuario.getSenhaHash())) {
            throw new BusinessException("Email ou senha invalidos");
        }

        if (!usuario.getAtivo()) {
            throw new BusinessException("Usuario inativo");
        }

        String token = jwtUtil.generateToken(usuario);
        return new AuthResponse(token, UserResponse.from(usuario));
    }

    public AuthResponse loginWithGoogle(GoogleAuthRequest request) {
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

            // Upsert user
            var usuario = usuarioRepository.findByGoogleId(googleId)
                    .orElseGet(() -> usuarioRepository.findByEmail(email)
                            .orElseGet(() -> {
                                var novo = new Usuario();
                                novo.setRole(Role.ALUNO);
                                return novo;
                            }));

            usuario.setGoogleId(googleId);
            usuario.setEmail(email);
            usuario.setNome(nome);
            usuarioRepository.save(usuario);

            if (!usuario.getAtivo()) {
                throw new BusinessException("Usuario inativo");
            }

            String token = jwtUtil.generateToken(usuario);
            return new AuthResponse(token, UserResponse.from(usuario));

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("Erro ao autenticar com Google");
        }
    }
}
