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
}
