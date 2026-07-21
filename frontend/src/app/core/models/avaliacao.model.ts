/** Avaliações do professor (docs/09 §8, Fase 3d). */
export type TipoAvaliacao = 'AVALIACAO' | 'OBSERVACAO' | 'RECOMENDACAO';

export interface Avaliacao {
  id: number;
  alunoId: number;
  tipo: TipoAvaliacao;
  conteudo: string;
  publico: boolean;
  autorNome: string;
  criadoEm: string;
}

export const TIPO_AVALIACAO_LABEL: Record<TipoAvaliacao, string> = {
  AVALIACAO: 'Avaliação',
  OBSERVACAO: 'Observação',
  RECOMENDACAO: 'Recomendação',
};
