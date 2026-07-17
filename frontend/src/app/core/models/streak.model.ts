/**
 * Streak SEMANAL do aluno (docs/01): semanas consecutivas com pelo menos 1
 * treino — não dias seguidos.
 */
export interface Streak {
  weeklyStreak: number;
  averagePerWeek: number;
  trainedThisWeek: boolean;
  contextualMessage: string;
}
