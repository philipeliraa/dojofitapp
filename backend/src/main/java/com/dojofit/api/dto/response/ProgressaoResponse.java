package com.dojofit.api.dto.response;

import com.dojofit.api.model.Graduacao;
import com.dojofit.api.model.enums.CorFaixa;

import java.time.LocalDate;

/**
 * Faixa/grau ATUAL do aluno numa modalidade (docs/02: resumo de progressão no
 * Início e no Perfil). Derivada da graduação mais recente. `desde` é a data
 * dessa graduação, base para "tempo na faixa atual" (docs/06 passo 2).
 */
public record ProgressaoResponse(
        Long modalidadeId,
        String modalidadeNome,
        String faixaNome,
        CorFaixa cor,
        Integer grau,
        LocalDate desde
) {
    public static ProgressaoResponse from(Graduacao g) {
        return new ProgressaoResponse(
                g.getModalidade().getId(),
                g.getModalidade().getNome(),
                g.getFaixa().getNome(),
                g.getFaixa().getCor(),
                g.getGrau(),
                g.getData()
        );
    }
}
