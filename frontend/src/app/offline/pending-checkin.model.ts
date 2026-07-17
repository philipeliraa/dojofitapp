/**
 * Registro da fila offline de check-in (docs/07 seção 8).
 * O `id` é o UUID gerado no cliente no momento da ação — o mesmo enviado ao
 * backend na sincronização, garantindo idempotência no reenvio.
 */
export interface PendingCheckin {
  id: string;
  aulaId: number;
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed';
  errorMessage?: string;
}
