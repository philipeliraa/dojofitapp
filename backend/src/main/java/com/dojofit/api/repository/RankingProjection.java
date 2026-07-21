package com.dojofit.api.repository;

/**
 * Projeção da agregação de ranking (docs/09 §9): total de treinos por aluno no
 * período. Os nomes dos getters casam com os aliases da query.
 */
public interface RankingProjection {
    Long getAlunoId();
    String getAlunoNome();
    long getTotalTreinos();
}
