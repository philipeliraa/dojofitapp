export interface Aula {
  id: number;
  turmaId: number | null;
  turmaNome: string | null;
  data: string;
  horaInicio: string;
  horaFim: string;
  capacidadeMaxima: number;
  professorId: number;
  professorNome: string;
  cancelada: boolean;
  observacao: string | null;
  checkinsConfirmados: number;
  vagasDisponiveis: number;
}
