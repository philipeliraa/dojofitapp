import { CorFaixa } from './progressao.model';

/** Modalidade e sua progressão configurável de faixas (docs/09 §5, Fase 3a). */
export interface Modalidade {
  id: number;
  nome: string;
  ativo: boolean;
}

export interface Faixa {
  id: number;
  modalidadeId: number;
  nome: string;
  cor: CorFaixa;
  ordem: number;
  grausMax: number;
}

/** Evento de graduação na linha do tempo do aluno (docs/01, docs/06 fluxo 3). */
export interface Graduacao {
  id: number;
  alunoId: number;
  alunoNome: string;
  modalidadeId: number;
  modalidadeNome: string;
  faixaId: number;
  faixaNome: string;
  cor: CorFaixa;
  grau: number;
  data: string;
  observacao: string | null;
  concedidaPorNome: string;
  criadoEm: string;
}
