import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { OfflineCheckinService } from './offline-checkin.service';
import { PendingCheckinQueueService } from './pending-checkin-queue.service';
import { ConnectionService } from '../core/services/connection.service';
import { environment } from '../../environments/environment';

describe('OfflineCheckinService', () => {
  let service: OfflineCheckinService;
  let queue: PendingCheckinQueueService;
  let connection: ConnectionService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OfflineCheckinService);
    queue = TestBed.inject(PendingCheckinQueueService);
    connection = TestBed.inject(ConnectionService);
    httpMock = TestBed.inject(HttpTestingController);
    queue.dbName = 'dojofit-offline-test';
    await queue.clear();
  });

  afterEach(() => httpMock.verify());

  it('offline: enfileira com UUID e não chama o backend (docs/05 seção 5)', async () => {
    (connection as any)._online.set(false);

    const outcome = await firstValueFrom(service.checkin(42));

    expect(outcome.kind).toBe('queued');
    const stored = await queue.getAll();
    expect(stored.length).toBe(1);
    expect(stored[0].aulaId).toBe(42);
    httpMock.expectNone(`${environment.apiUrl}/checkins`);
  });

  it('online: envia direto ao backend sem enfileirar', async () => {
    const promise = firstValueFrom(service.checkin(42));

    const req = httpMock.expectOne(`${environment.apiUrl}/checkins`);
    req.flush({ id: 1, status: 'CONFIRMADO', clientId: req.request.body.clientId });

    const outcome = await promise;
    expect(outcome.kind).toBe('confirmed');
    expect((await queue.getAll()).length).toBe(0);
  });

  it('falha de rede no envio (status 0): cai na fila com o mesmo UUID', async () => {
    const promise = firstValueFrom(service.checkin(42));

    const req = httpMock.expectOne(`${environment.apiUrl}/checkins`);
    const clientId = req.request.body.clientId;
    req.error(new ProgressEvent('error'), { status: 0 });

    const outcome = await promise;
    expect(outcome.kind).toBe('queued');
    const stored = await queue.getAll();
    expect(stored[0].id).toBe(clientId);
  });

  it('falha de regra de negócio (422) NÃO é enfileirada — propaga na hora (docs/07 seção 6)', async () => {
    const promise = firstValueFrom(service.checkin(42));

    httpMock.expectOne(`${environment.apiUrl}/checkins`)
      .flush({ error: 'Limite semanal atingido' }, { status: 422, statusText: 'Unprocessable Entity' });

    await expect(promise).rejects.toBeDefined();
    expect((await queue.getAll()).length).toBe(0);
  });

  it('aula já na fila: não duplica nem chama o backend', async () => {
    await queue.enqueue({ id: 'uuid-existente', aulaId: 42, timestamp: Date.now(), status: 'pending' });

    const outcome = await firstValueFrom(service.checkin(42));

    expect(outcome).toEqual({ kind: 'queued', clientId: 'uuid-existente' });
    expect((await queue.getAll()).length).toBe(1);
    httpMock.expectNone(`${environment.apiUrl}/checkins`);
  });
});
