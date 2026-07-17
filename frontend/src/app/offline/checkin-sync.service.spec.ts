import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CheckinSyncService } from './checkin-sync.service';
import { PendingCheckinQueueService } from './pending-checkin-queue.service';
import { environment } from '../../environments/environment';

describe('CheckinSyncService', () => {
  let service: CheckinSyncService;
  let queue: PendingCheckinQueueService;
  let httpMock: HttpTestingController;

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

    service = TestBed.inject(CheckinSyncService);
    service.baseDelayMs = 0;
    // Aguarda a sincronização automática do boot (fila vazia) terminar
    await new Promise(r => setTimeout(r, 0));
  });

  afterEach(() => httpMock.verify());

  it('sincroniza item pendente com o MESMO UUID da ação original (idempotência)', async () => {
    await queue.enqueue({ id: 'uuid-original', aulaId: 42, timestamp: Date.now(), status: 'pending' });

    const done = service.syncPending();
    const req = await waitForRequest(`${environment.apiUrl}/checkins`);
    expect(req.request.body.clientId).toBe('uuid-original');
    expect(req.request.body.aulaId).toBe(42);
    req.flush({ id: 1, status: 'CONFIRMADO', clientId: 'uuid-original' });
    await done;

    expect((await queue.getAll()).length).toBe(0);
    expect(service.lastResult()?.ok).toBe(true);
  });

  it('falha de regra de negócio na sincronização marca failed e notifica — sem retry', async () => {
    await queue.enqueue({ id: 'uuid-limite', aulaId: 42, timestamp: Date.now(), status: 'pending' });

    const done = service.syncPending();
    const req = await waitForRequest(`${environment.apiUrl}/checkins`);
    req.flush({ error: 'Limite semanal atingido' }, { status: 422, statusText: 'Unprocessable Entity' });
    await done;

    const stored = await queue.getAll();
    expect(stored[0].status).toBe('failed');
    expect(service.lastResult()).toEqual({ aulaId: 42, ok: false, message: 'Limite semanal atingido' });
    httpMock.expectNone(`${environment.apiUrl}/checkins`);
  });

  it('falha de rede re-tenta com backoff e devolve o item a pending ao esgotar', async () => {
    await queue.enqueue({ id: 'uuid-rede', aulaId: 42, timestamp: Date.now(), status: 'pending' });

    const done = service.syncPending();
    // 1 tentativa inicial + 4 retries de rede
    for (let i = 0; i < 5; i++) {
      const req = await waitForRequest(`${environment.apiUrl}/checkins`);
      req.error(new ProgressEvent('error'), { status: 0 });
    }
    await done;

    const stored = await queue.getAll();
    expect(stored[0].status).toBe('pending');
  });

  it('itens failed não são reenviados na sincronização', async () => {
    await queue.enqueue({ id: 'uuid-failed', aulaId: 42, timestamp: Date.now(), status: 'failed' });

    await service.syncPending();

    httpMock.expectNone(`${environment.apiUrl}/checkins`);
    expect((await queue.getAll())[0].status).toBe('failed');
  });
});
