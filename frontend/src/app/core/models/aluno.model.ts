/** Visão de coaching do aluno (docs/02 §2, docs/06). */
export interface AlunoResumo {
  id: number;
  nome: string;
  email: string;
}

export interface AlunoDetalhe {
  id: number;
  nome: string;
  email: string;
  totalCheckins: number;
}
