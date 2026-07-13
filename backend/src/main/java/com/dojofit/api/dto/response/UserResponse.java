package com.dojofit.api.dto.response;

import com.dojofit.api.model.Usuario;

public record UserResponse(
        Long id,
        String nome,
        String email,
        String role,
        Boolean ativo
) {
    public static UserResponse from(Usuario usuario) {
        return new UserResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getRole().name(),
                usuario.getAtivo()
        );
    }
}
