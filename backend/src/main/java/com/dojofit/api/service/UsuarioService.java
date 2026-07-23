package com.dojofit.api.service;

import com.dojofit.api.dto.request.UsuarioRequest;
import com.dojofit.api.dto.response.UserResponse;
import com.dojofit.api.exception.BusinessException;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.model.enums.Role;
import com.dojofit.api.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> findAll(String roleFilter) {
        List<Usuario> usuarios;
        if (roleFilter != null && !roleFilter.isEmpty()) {
            usuarios = usuarioRepository.findByRole(Role.valueOf(roleFilter));
        } else {
            usuarios = usuarioRepository.findAll();
        }
        return usuarios.stream().map(UserResponse::from).toList();
    }

    public UserResponse create(UsuarioRequest request, Long criadorId) {
        if (usuarioRepository.findByEmail(request.email()).isPresent()) {
            throw new BusinessException("Email ja cadastrado");
        }

        // Tenant do novo usuário = academia de quem o cadastra (docs/01:
        // multi-tenant-ready). O papel é atribuído pela academia, nunca
        // autodeclarado (CLAUDE.md não-negociável).
        var criador = getUsuario(criadorId);

        var usuario = new Usuario();
        usuario.setNome(request.nome());
        usuario.setEmail(request.email());
        usuario.setRole(Role.valueOf(request.role()));
        usuario.setAcademia(criador.getAcademia());
        if (request.senha() != null && !request.senha().isEmpty()) {
            usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
        }

        return UserResponse.from(usuarioRepository.save(usuario));
    }

    public UserResponse update(Long id, UsuarioRequest request) {
        var usuario = getUsuario(id);
        usuario.setNome(request.nome());
        usuario.setEmail(request.email());
        usuario.setRole(Role.valueOf(request.role()));
        if (request.senha() != null && !request.senha().isEmpty()) {
            usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
        }

        return UserResponse.from(usuarioRepository.save(usuario));
    }

    public void toggleAtivo(Long id) {
        var usuario = getUsuario(id);
        usuario.setAtivo(!usuario.getAtivo());
        usuarioRepository.save(usuario);
    }

    public void delete(Long id) {
        var usuario = getUsuario(id);
        usuarioRepository.delete(usuario);
    }

    private Usuario getUsuario(Long id) {
        return usuarioRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Usuario nao encontrado"));
    }
}
