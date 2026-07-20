package com.dojofit.api.dto.response;

import com.dojofit.api.model.Graduacao;
import com.dojofit.api.model.enums.CorFaixa;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record GraduacaoResponse(
        Long id,
        Long alunoId,
        String alunoNome,
        Long modalidadeId,
        String modalidadeNome,
        Long faixaId,
        String faixaNome,
        CorFaixa cor,
        Integer grau,
        LocalDate data,
        String observacao,
        String concedidaPorNome,
        LocalDateTime criadoEm
) {
    public static GraduacaoResponse from(Graduacao g) {
        return new GraduacaoResponse(
                g.getId(),
                g.getAluno().getId(),
                g.getAluno().getNome(),
                g.getModalidade().getId(),
                g.getModalidade().getNome(),
                g.getFaixa().getId(),
                g.getFaixa().getNome(),
                g.getFaixa().getCor(),
                g.getGrau(),
                g.getData(),
                g.getObservacao(),
                g.getConcedidaPor().getNome(),
                g.getCriadoEm()
        );
    }
}
