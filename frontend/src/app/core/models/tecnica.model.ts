/** Técnicas (docs/09 §6, Fase 3b). */
export type StatusTecnica = 'EM_DESENVOLVIMENTO' | 'DOMINADA';

/** Técnica do catálogo de uma modalidade. */
export interface Tecnica {
  id: number;
  modalidadeId: number;
  nome: string;
  descricao: string | null;
}

/** Status de uma técnica para um aluno (avaliação de coaching). */
export interface TecnicaAluno {
  tecnicaId: number;
  tecnicaNome: string;
  modalidadeId: number;
  modalidadeNome: string;
  status: StatusTecnica;
  atualizadoEm: string;
}
