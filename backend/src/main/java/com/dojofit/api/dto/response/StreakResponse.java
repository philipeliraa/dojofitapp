package com.dojofit.api.dto.response;

/**
 * Streak SEMANAL do aluno (docs/01): semanas consecutivas com pelo menos 1
 * treino — não dias seguidos — com média de treinos no período e feedback
 * contextual baseado no padrão do aluno.
 */
public record StreakResponse(
        int weeklyStreak,
        double averagePerWeek,
        boolean trainedThisWeek,
        String contextualMessage
) {
}
