package com.dojofit.api.dto.response;

import com.dojofit.api.model.Faixa;
import com.dojofit.api.model.enums.CorFaixa;

public record FaixaResponse(
        Long id,
        Long modalidadeId,
        String nome,
        CorFaixa cor,
        Integer ordem,
        Integer grausMax
) {
    public static FaixaResponse from(Faixa f) {
        return new FaixaResponse(f.getId(), f.getModalidade().getId(), f.getNome(), f.getCor(), f.getOrdem(), f.getGrausMax());
    }
}
