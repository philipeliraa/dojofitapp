package com.dojofit.api.dto.response;

import com.dojofit.api.model.Modalidade;

public record ModalidadeResponse(Long id, String nome, Boolean ativo) {
    public static ModalidadeResponse from(Modalidade m) {
        return new ModalidadeResponse(m.getId(), m.getNome(), m.getAtivo());
    }
}
