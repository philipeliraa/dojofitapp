/**
 * Mural (docs/02 §4, Fase 2). O feed vem do backend com os feedbacks já
 * filtrados por visibilidade (aluno vê só os próprios; Professor/Admin vê
 * todos) — o front apenas renderiza o que recebe.
 */
export interface FeedbackAviso {
  id: number;
  avisoId: number;
  autorId: number;
  autorNome: string;
  conteudo: string;
  criadoEm: string;
}

export interface Aviso {
  id: number;
  titulo: string;
  conteudo: string;
  autorId: number;
  autorNome: string;
  criadoEm: string;
  feedbacks: FeedbackAviso[];
}
