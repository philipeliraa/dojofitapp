/** Campeonatos e medalhas (docs/09 §7, Fase 3c). */
export type ResultadoCampeonato = 'OURO' | 'PRATA' | 'BRONZE' | 'PARTICIPACAO';

export interface Campeonato {
  id: number;
  alunoId: number;
  nome: string;
  data: string;
  resultado: ResultadoCampeonato;
  categoria: string | null;
  observacao: string | null;
  registradoPorNome: string;
}

/** Rótulo e emoji de medalha por resultado (ícones via emoji, como a navegação). */
export const RESULTADO_INFO: Record<ResultadoCampeonato, { emoji: string; label: string }> = {
  OURO: { emoji: '🥇', label: 'Ouro' },
  PRATA: { emoji: '🥈', label: 'Prata' },
  BRONZE: { emoji: '🥉', label: 'Bronze' },
  PARTICIPACAO: { emoji: '🎽', label: 'Participação' },
};
