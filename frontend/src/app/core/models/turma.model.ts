export type DiaSemana = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export interface Turma {
  id: number;
  nome: string;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFim: string;
  capacidadeMaxima: number;
  professorId: number;
  professorNome: string;
  ativo: boolean;
}
