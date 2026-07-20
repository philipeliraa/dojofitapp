package com.dojofit.api.dto.response;

import com.dojofit.api.model.Usuario;

public record AlunoResumoResponse(Long id, String nome, String email) {
    public static AlunoResumoResponse from(Usuario u) {
        return new AlunoResumoResponse(u.getId(), u.getNome(), u.getEmail());
    }
}
