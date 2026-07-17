import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, from, map, of, throwError } from 'rxjs';
import { CheckinApiService, CheckinResponse } from '../core/services/checkin-api.service';
import { ConnectionService } from '../core/services/connection.service';
import { PendingCheckinQueueService } from './pending-checkin-queue.service';

export type CheckinOutcome =
  | { kind: 'confirmed'; response: CheckinResponse }
  | { kind: 'queued'; clientId: string };

/**
 * Check-in com tolerância a rede instável (docs/05 seção 5): sem conexão — ou
 * com falha de rede no envio — a ação entra na fila local com UI otimista.
 * Falha de REGRA DE NEGÓCIO (limite semanal, aula cancelada...) não é
 * enfileirada nem re-tentada: propaga na hora (docs/07 seção 6).
 */
@Injectable({ providedIn: 'root' })
export class OfflineCheckinService {
  constructor(
    private api: CheckinApiService,
    private queue: PendingCheckinQueueService,
    private connection: ConnectionService,
  ) {}

  checkin(aulaId: number): Observable<CheckinOutcome> {
    const existing = this.queue.findByAula(aulaId);
    if (existing) {
      return of<CheckinOutcome>({ kind: 'queued', clientId: existing.id });
    }

    const clientId = crypto.randomUUID();

    if (!this.connection.online()) {
      return from(this.enqueue(aulaId, clientId));
    }

    return this.api.checkin(aulaId, clientId).pipe(
      map(response => ({ kind: 'confirmed', response }) as CheckinOutcome),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 0) {
          return from(this.enqueue(aulaId, clientId));
        }
        return throwError(() => err);
      }),
    );
  }

  private async enqueue(aulaId: number, clientId: string): Promise<CheckinOutcome> {
    await this.queue.enqueue({ id: clientId, aulaId, timestamp: Date.now(), status: 'pending' });
    return { kind: 'queued', clientId };
  }
}
