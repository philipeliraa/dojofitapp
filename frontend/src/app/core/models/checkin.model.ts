export type TipoCheckin = 'PROPRIO' | 'PROFESSOR';
export type StatusCheckin = 'CONFIRMADO' | 'LISTA_ESPERA' | 'EXCECAO_LIBERADA';

export interface Checkin {
  id: number;
  aulaId: number;
  alunoId: number;
  alunoNome: string;
  dataHoraCheckin: string;
  tipo: TipoCheckin;
  status: StatusCheckin;
  turmaNome: string;
  aulaData: string;
  aulaHoraInicio: string;
}
