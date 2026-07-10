export type StatusContrato = 'ATIVO' | 'EXPIRADO';

export interface Contrato {
  id: number;
  alunoId: number;
  alunoNome: string;
  planoId: number;
  planoNome: string;
  dataInicio: string;
  dataValidade: string;
  status: StatusContrato;
}
