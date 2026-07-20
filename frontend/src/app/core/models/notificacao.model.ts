export type TipoNotificacao = 'GRADUACAO';

export interface Notificacao {
  id: number;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  lida: boolean;
  referenciaId: number | null;
  criadoEm: string;
}
