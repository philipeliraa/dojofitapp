package com.dojofit.api.dto.response;

/**
 * Item do ranking da academia (docs/09 §9): posição, aluno e total de treinos
 * no período.
 */
public record RankingItemResponse(
        int posicao,
        Long alunoId,
        String alunoNome,
        long totalTreinos
) {}
