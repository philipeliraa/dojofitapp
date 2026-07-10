package com.dojofit.api.dto.response;

import com.dojofit.api.model.Contrato;

public record ContratoResponse(
        Long id, Long alunoId, String alunoNome, Long planoId, String planoNome,
        String dataInicio, String dataValidade, String status
) {
    public static ContratoResponse from(Contrato c) {
        return new ContratoResponse(
                c.getId(), c.getAluno().getId(), c.getAluno().getNome(),
                c.getPlano().getId(), c.getPlano().getNome(),
                c.getDataInicio().toString(), c.getDataValidade().toString(),
                c.getStatus().name()
        );
    }
}
