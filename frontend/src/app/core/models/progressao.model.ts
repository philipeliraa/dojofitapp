/**
 * Progressão de faixa/grau (docs/02, Fase 3a). CorFaixa espelha o enum do
 * backend e está presa aos 5 tokens belt.* de docs/03.
 */
export type CorFaixa = 'BRANCA' | 'AZUL' | 'ROXA' | 'MARROM' | 'PRETA';

export interface Progressao {
  modalidadeId: number;
  modalidadeNome: string;
  faixaNome: string;
  cor: CorFaixa;
  grau: number;
  desde: string;
  /** Máximo de graus da faixa atual (define se o aluno está no último grau). */
  grausMax: number;
  /** Check-ins acumulados desde a graduação atual (spec tela-inicio §3). */
  checkinsNoGrau: number;
  /** Meta indicativa de check-ins por grau, definida pela academia. */
  checkinsNecessarios: number;
  /** Próxima faixa da sequência (nula se já for a última). */
  proximaFaixaNome?: string;
  proximaFaixaCor?: CorFaixa;
}
