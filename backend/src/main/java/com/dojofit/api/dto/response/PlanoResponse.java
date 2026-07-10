package com.dojofit.api.dto.response;

import com.dojofit.api.model.Plano;

public record PlanoResponse(Long id, String nome, Integer limiteSemanal, Boolean ativo) {
    public static PlanoResponse from(Plano p) {
        return new PlanoResponse(p.getId(), p.getNome(), p.getLimiteSemanal(), p.getAtivo());
    }
}
