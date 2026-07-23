package com.dojofit.api.dto.response;

import com.dojofit.api.model.enums.CorFaixa;

import java.time.LocalDate;

/**
 * Faixa/grau ATUAL do aluno numa modalidade (docs/02: resumo de progressão no
 * Início e no Perfil). Derivada da graduação mais recente. `desde` é a data
 * dessa graduação, base para "tempo na faixa atual" (docs/06 passo 2).
 *
 * A partir da spec tela-inicio §3, carrega também os dados da barra de
 * progresso: {@code checkinsNoGrau} (acumulados desde a graduação atual),
 * {@code checkinsNecessarios} (meta indicativa do professor) e a próxima faixa
 * da sequência ({@code proximaFaixaNome}/{@code proximaFaixaCor}, nulos se já
 * for a última). Montada no service — não mais por um {@code from(Graduacao)},
 * porque agora depende de contagem e da sequência de faixas.
 */
public record ProgressaoResponse(
        Long modalidadeId,
        String modalidadeNome,
        String faixaNome,
        CorFaixa cor,
        Integer grau,
        LocalDate desde,
        Integer grausMax,
        Integer checkinsNoGrau,
        Integer checkinsNecessarios,
        String proximaFaixaNome,
        CorFaixa proximaFaixaCor
) {
}
