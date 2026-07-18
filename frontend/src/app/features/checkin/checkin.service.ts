import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Checkin } from '../../core/models/checkin.model';
import { Streak } from '../../core/models/streak.model';
import { CheckinApiService, CheckinResponse } from '../../core/services/checkin-api.service';
import { StreakApiService } from '../../core/services/streak-api.service';
import { OfflineCheckinService, CheckinOutcome } from '../../offline/offline-checkin.service';
import { PendingCheckinQueueService } from '../../offline/pending-checkin-queue.service';
import { CheckinSyncService } from '../../offline/checkin-sync.service';
import { formatDateLocal } from '../../core/utils/data.util';
import type { DojofitCheckInState } from '../../shared/components/composed/dojofit-check-in-button.component';

export interface ResumoSemanal {
  count: number;
  limite?: number;
}

/**
 * Serviço único de check-in (docs/07 seção 5) — substitui a lógica antes
 * triplicada entre Início do aluno, Calendário do aluno e Chamada do
 * professor. Cada feature service expõe Signals privados/computed()
 * somente-leitura, conforme padrão do documento.
 */
@Injectable({ providedIn: 'root' })
export class CheckInService {
  private readonly http = inject(HttpClient);
  private readonly checkinApi = inject(CheckinApiService);
  private readonly offlineCheckin = inject(OfflineCheckinService);
  private readonly streakApi = inject(StreakApiService);
  private readonly queue = inject(PendingCheckinQueueService);
  private readonly checkinSync = inject(CheckinSyncService);

  // --- Autocheck-in do aluno (Início + Calendário) ---
  private readonly _historico = signal<Checkin[]>([]);
  readonly historico = this._historico.asReadonly();

  private readonly _weekInfo = signal<ResumoSemanal | null>(null);
  readonly weekInfo = this._weekInfo.asReadonly();

  private readonly _streak = signal<Streak | null>(null);
  readonly streak = this._streak.asReadonly();

  readonly pendingAulaIds = this.queue.pendingAulaIds;

  /**
   * Check-ins do próprio aluno hoje, por aula — check-in só vale no dia da
   * aula (docs/01). Objeto completo (não só o id) para dar acesso ao
   * status e distinguir confirmado de lista de espera (dojofit-check-in-button).
   */
  readonly checkinPorAulaHoje = computed(() => {
    const hoje = formatDateLocal(new Date());
    const map = new Map<number, Checkin>();
    this._historico()
      .filter(c => c.aulaData === hoje)
      .forEach(c => map.set(c.aulaId, c));
    return map;
  });

  /**
   * Estado para dojofit-check-in-button (docs/04): 'blocked' é proativo —
   * calculado a partir do weekInfo já carregado, sem esperar o aluno
   * clicar e o backend rejeitar, para não deixar tentar algo fadado a falhar
   * (docs/05 seção 1).
   */
  estadoCheckInPara(aulaId: number): DojofitCheckInState {
    const checkin = this.checkinPorAulaHoje().get(aulaId);
    if (checkin) {
      return checkin.status === 'LISTA_ESPERA' ? 'waitlisted' : 'checked-in';
    }
    const semana = this.weekInfo();
    if (semana?.limite != null && semana.count >= semana.limite) {
      return 'blocked';
    }
    return 'available';
  }

  // --- Chamada do professor (roster de uma aula) ---
  private readonly _checkinsDaAula = signal<Checkin[]>([]);
  readonly checkinsDaAula = this._checkinsDaAula.asReadonly();

  constructor() {
    // Reconciliação pós-sincronização offline (docs/05 seção 5): sucesso
    // atualiza o resumo; falha de regra de negócio já reflete via
    // pendingAulaIds (item marcado failed some da fila) — cada componente
    // decide como notificar o usuário observando checkinSync.lastResult().
    effect(() => {
      if (this.checkinSync.lastResult()?.ok) {
        this.carregarResumo();
      }
    });
  }

  carregarResumo(): void {
    this.http.get<Checkin[]>(`${environment.apiUrl}/checkins/historico`).subscribe(data => this._historico.set(data));
    this.http.get<ResumoSemanal>(`${environment.apiUrl}/checkins/semana`).subscribe(data => this._weekInfo.set(data));
    this.streakApi.getStreak().subscribe(data => this._streak.set(data));
  }

  checkin(aulaId: number): Observable<CheckinOutcome> {
    return this.offlineCheckin.checkin(aulaId).pipe(
      tap(outcome => {
        if (outcome.kind === 'confirmed') this.carregarResumo();
      }),
    );
  }

  cancelCheckin(aulaId: number): Observable<void> {
    const checkin = this.checkinPorAulaHoje().get(aulaId);
    if (!checkin) return of(void 0);

    return this.http.delete<void>(`${environment.apiUrl}/checkins/${checkin.id}`).pipe(
      tap(() => this.carregarResumo()),
    );
  }

  carregarChecacksDaAula(aulaId: number): void {
    this.http.get<Checkin[]>(`${environment.apiUrl}/checkins/aula/${aulaId}`).subscribe(data => this._checkinsDaAula.set(data));
  }

  manualCheckin(aulaId: number, alunoId: number): Observable<CheckinResponse> {
    return this.checkinApi.manualCheckin(aulaId, alunoId).pipe(
      tap(() => this.carregarChecacksDaAula(aulaId)),
    );
  }

  liberarExcecao(checkinId: number, aulaId: number): Observable<CheckinResponse> {
    return this.http.post<CheckinResponse>(`${environment.apiUrl}/checkins/${checkinId}/excecao`, {}).pipe(
      tap(() => this.carregarChecacksDaAula(aulaId)),
    );
  }
}
