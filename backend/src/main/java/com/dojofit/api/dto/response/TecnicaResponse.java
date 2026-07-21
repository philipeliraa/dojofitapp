package com.dojofit.api.dto.response;

import com.dojofit.api.model.Tecnica;

public record TecnicaResponse(
        Long id,
        Long modalidadeId,
        String nome,
        String descricao
) {
    public static TecnicaResponse from(Tecnica t) {
        return new TecnicaResponse(t.getId(), t.getModalidade().getId(), t.getNome(), t.getDescricao());
    }
}
