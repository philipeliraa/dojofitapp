import { TestBed } from '@angular/core/testing';
import { formatDateLocal } from '../../core/utils/data.util';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { CheckInService } from './checkin.service';
import { PendingCheckinQueueService } from '../../offline/pending-checkin-queue.service';
import { CheckinSyncService } from '../../offline/checkin-sync.service';
import { ConnectionService } from '../../core/services/connection.service';
import { environment } from '../../../environments/environment';

describe('CheckInService', () => {
  let service: CheckInService;
  let queue: PendingCheckinQueueService;
  let sync: CheckinSyncService;
  let httpMock: HttpTestingController;

  const hoje = formatDateLocal(new Date());

  const waitForRequest = async (url: string, tries = 50) => {
    for (let i = 0; i < tries; i++) {
      await new Promise(r => setTimeout(r, 0));
      const reqs = httpMock.match(url);
      if (reqs.length > 0) return reqs[0];
    }
    throw new Error(`Nenhuma requisição para ${url}`);
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    queue = TestBed.inject(PendingCheckinQueueService);
    queue.dbName = 'dojofit-offline-test';
    await queue.clear();

    sync = TestBed.inject(CheckinSyncService);
    sync.baseDelayMs = 0;
    await new Promise(r => setTimeout(r, 0)); // drena o sync automático do boot (fila vazia)

    service = TestBed.inject(CheckInService);
  });

  afterEach(() => httpMock.verify());

  it('carregarResumo busca histórico, resumo semanal e streak', () => {
    service.carregarResumo();

    httpMock.expectOne(`${environment.apiUrl}/checkins/historico`).flush([
      { id: 1, aulaId: 10, aulaData: hoje, alunoId: 1, alunoNome: 'A', dataHoraCheckin: '', tipo: 'PROPRIO', status: 'CONFIRMADO', turmaNome: '', aulaHoraInicio: '' },
    ]);
    httpMock.expectOne(`${environment.apiUrl}/checkins/semana`).flush({ count: 2, limite: 3 });
    httpMock.expectOne(`${environment.apiUrl}/checkins/streak`).flush({ weeklyStreak: 1, averagePerWeek: 1, trainedThisWeek: true, contextualMessage: 'ok' });

    expect(service.historico().length).toBe(1);
    expect(service.weekInfo()).toEqual({ count: 2, limite: 3 });
    expect(service.streak()?.weeklyStreak).toBe(1);
  });

  it('checkinIdPorAulaHoje filtra o histórico por check-ins de HOJE (docs/01)', () => {
    service.carregarResumo();
    httpMock.expectOne(`${environment.apiUrl}/checkins/historico`).flush([
      { id: 1, aulaId: 10, aulaData: hoje, alunoId: 1, alunoNome: 'A', dataHoraCheckin: '', tipo: 'PROPRIO', status: 'CONFIRMADO', turmaNome: '', aulaHoraInicio: '' },
      { id: 2, aulaId: 20, aulaData: '2000-01-01', alunoId: 1, alunoNome: 'A', dataHoraCheckin: '', tipo: 'PROPRIO', status: 'CONFIRMADO', turmaNome: '', aulaHoraInicio: '' },
    ]);
    httpMock.expectOne(`${environment.apiUrl}/checkins/semana`).flush({ count: 1 });
    httpMock.expectOne(`${environment.apiUrl}/checkins/streak`).flush({ weeklyStreak: 0, averagePerWeek: 0, trainedThisWeek: false, contextualMessage: '' });

    const map = service.checkinIdPorAulaHoje();
    expect(map.get(10)).toBe(1);
    expect(map.has(20)).toBe(false);
  });

  it('checkin confirmado recarrega o resumo automaticamente', async () => {
    const promise = firstValueFrom(service.checkin(42));

    const req = await waitForRequest(`${environment.apiUrl}/checkins`);
    req.flush({ id: 5, clientId: req.request.body.clientId, aulaId: 42, status: 'CONFIRMADO' });
    await promise;

    // carregarResumo() disparado internamente pelo tap()
    httpMock.expectOne(`${environment.apiUrl}/checkins/historico`).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/checkins/semana`).flush({ count: 1 });
    httpMock.expectOne(`${environment.apiUrl}/checkins/streak`).flush({ weeklyStreak: 0, averagePerWeek: 0, trainedThisWeek: false, contextualMessage: '' });
  });

  it('checkin enfileirado (offline) NÃO recarrega o resumo — nada mudou no backend ainda', async () => {
    const connection = TestBed.inject(ConnectionService);
    (connection as any)._online.set(false);

    const outcome = await firstValueFrom(service.checkin(42));

    expect(outcome.kind).toBe('queued');
    httpMock.expectNone(`${environment.apiUrl}/checkins/historico`);
  });

  it('cancelCheckin sem check-in hoje para a aula é um no-op silencioso', async () => {
    await firstValueFrom(service.cancelCheckin(999));
    httpMock.expectNone(`${environment.apiUrl}/checkins/999`);
  });

  it('cancelCheckin remove o check-in de hoje e recarrega o resumo', async () => {
    service.carregarResumo();
    httpMock.expectOne(`${environment.apiUrl}/checkins/historico`).flush([
      { id: 7, aulaId: 42, aulaData: hoje, alunoId: 1, alunoNome: 'A', dataHoraCheckin: '', tipo: 'PROPRIO', status: 'CONFIRMADO', turmaNome: '', aulaHoraInicio: '' },
    ]);
    httpMock.expectOne(`${environment.apiUrl}/checkins/semana`).flush({ count: 1 });
    httpMock.expectOne(`${environment.apiUrl}/checkins/streak`).flush({ weeklyStreak: 0, averagePerWeek: 0, trainedThisWeek: false, contextualMessage: '' });

    const promise = firstValueFrom(service.cancelCheckin(42));
    httpMock.expectOne(`${environment.apiUrl}/checkins/7`).flush(null);
    await promise;

    httpMock.expectOne(`${environment.apiUrl}/checkins/historico`).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/checkins/semana`).flush({ count: 0 });
    httpMock.expectOne(`${environment.apiUrl}/checkins/streak`).flush({ weeklyStreak: 0, averagePerWeek: 0, trainedThisWeek: false, contextualMessage: '' });
  });

  it('carregarChecacksDaAula busca o roster de check-ins de uma aula (Chamada)', () => {
    service.carregarChecacksDaAula(42);
    httpMock.expectOne(`${environment.apiUrl}/checkins/aula/42`).flush([
      { id: 1, aulaId: 42, alunoId: 1, alunoNome: 'Aluno', dataHoraCheckin: '', tipo: 'PROPRIO', status: 'CONFIRMADO', turmaNome: '', aulaData: hoje, aulaHoraInicio: '' },
    ]);
    expect(service.checkinsDaAula().length).toBe(1);
  });

  it('manualCheckin (override do professor) recarrega o roster da aula', async () => {
    const promise = firstValueFrom(service.manualCheckin(42, 7));
    const req = httpMock.expectOne(`${environment.apiUrl}/checkins/manual`);
    expect(req.request.body).toEqual(expect.objectContaining({ aulaId: 42, alunoId: 7 }));
    req.flush({ id: 1, aulaId: 42, status: 'CONFIRMADO' });
    await promise;

    httpMock.expectOne(`${environment.apiUrl}/checkins/aula/42`).flush([]);
  });

  it('liberarExcecao recarrega o roster da aula', async () => {
    const promise = firstValueFrom(service.liberarExcecao(9, 42));
    httpMock.expectOne(`${environment.apiUrl}/checkins/9/excecao`).flush({ id: 9, aulaId: 42, status: 'EXCECAO_LIBERADA' });
    await promise;

    httpMock.expectOne(`${environment.apiUrl}/checkins/aula/42`).flush([]);
  });

  it('sincronização bem-sucedida da fila offline recarrega o resumo automaticamente', async () => {
    await queue.enqueue({ id: 'uuid-1', aulaId: 42, timestamp: Date.now(), status: 'pending' });

    const done = sync.syncPending();
    const req = await waitForRequest(`${environment.apiUrl}/checkins`);
    req.flush({ id: 1, clientId: 'uuid-1', aulaId: 42, status: 'CONFIRMADO' });
    await done;

    // O effect() do CheckInService reage a checkinSync.lastResult() e recarrega —
    // fora de um componente, o TestBed não dispara effects sozinho
    TestBed.flushEffects();
    httpMock.expectOne(`${environment.apiUrl}/checkins/historico`).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/checkins/semana`).flush({ count: 1 });
    httpMock.expectOne(`${environment.apiUrl}/checkins/streak`).flush({ weeklyStreak: 0, averagePerWeek: 0, trainedThisWeek: false, contextualMessage: '' });
  });
});
