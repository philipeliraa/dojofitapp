import { Injectable, effect, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CheckinApiService } from '../core/services/checkin-api.service';
import { ConnectionService } from '../core/services/connection.service';
import { PendingCheckinQueueService } from './pending-checkin-queue.service';
import { PendingCheckin } from './pending-checkin.model';

export interface SyncResult {
  aulaId: number;
  ok: boolean;
  message?: string;
}

/**
 * Sincronização da fila offline (docs/05 seção 5, docs/07 seção 8):
 * dispara ao reconectar; reenvia cada item com o MESMO UUID gerado na ação
 * (o backend deduplica — etapa de idempotência já entregue). Falha de rede
 * re-tenta com backoff exponencial; falha de regra de negócio marca `failed`
 * e notifica — nunca re-tenta.
 */
@Injectable({ providedIn: 'root' })
export class CheckinSyncService {
  /** Base do backoff exponencial (1s, 2s, 4s...); zerada nos testes. */
  baseDelayMs = 1000;
  private static readonly MAX_NETWORK_RETRIES = 4;

  private readonly _lastResult = signal<SyncResult | null>(null);
  readonly lastResult = this._lastResult.asReadonly();

  private syncing = false;

  constructor(
    private queue: PendingCheckinQueueService,
    private api: CheckinApiService,
    private connection: ConnectionService,
  ) {
    // Ao reconectar (e no boot do app), sincroniza o que ficou na fila
    effect(() => {
      if (this.connection.online()) {
        void this.syncPending();
      }
    });
  }

  async syncPending(): Promise<void> {
    if (this.syncing) return;
    this.syncing = true;
    try {
      const items = (await this.queue.getAll()).filter(i => i.status !== 'failed');
      for (const item of items) {
        await this.syncItem(item);
      }
    } finally {
      this.syncing = false;
    }
  }

  private async syncItem(item: PendingCheckin, attempt = 0): Promise<void> {
    await this.queue.setStatus(item.id, 'syncing');
    try {
      // Mesmo UUID da ação original — reenvio seguro por idempotência (docs/07 seção 6)
      await firstValueFrom(this.api.checkin(item.aulaId, item.id));
      await this.queue.remove(item.id);
      this._lastResult.set({ aulaId: item.aulaId, ok: true });
    } catch (err) {
      const httpErr = err as HttpErrorResponse;
      const isNetworkFailure = httpErr.status === 0 || httpErr.status >= 500;

      if (isNetworkFailure) {
        if (attempt < CheckinSyncService.MAX_NETWORK_RETRIES) {
          await this.delay(this.baseDelayMs * 2 ** attempt);
          return this.syncItem(item, attempt + 1);
        }
        // Esgotou as tentativas: volta a pending e aguarda o próximo evento online
        await this.queue.setStatus(item.id, 'pending');
      } else {
        // Regra de negócio: falha definitiva — reverte o estado otimista e notifica
        const message = httpErr.error?.error || 'Check-in nao pode ser sincronizado';
        await this.queue.setStatus(item.id, 'failed', message);
        this._lastResult.set({ aulaId: item.aulaId, ok: false, message });
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
