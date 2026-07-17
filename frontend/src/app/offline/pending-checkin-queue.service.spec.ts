import { TestBed } from '@angular/core/testing';
import { PendingCheckinQueueService } from './pending-checkin-queue.service';
import { PendingCheckin } from './pending-checkin.model';

describe('PendingCheckinQueueService', () => {
  let service: PendingCheckinQueueService;

  const item = (overrides: Partial<PendingCheckin> = {}): PendingCheckin => ({
    id: crypto.randomUUID(),
    aulaId: 42,
    timestamp: Date.now(),
    status: 'pending',
    ...overrides,
  });

  beforeEach(async () => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PendingCheckinQueueService);
    service.dbName = 'dojofit-offline-test';
    await service.clear();
  });

  it('persiste o check-in enfileirado no IndexedDB e expõe via signal', async () => {
    const pendente = item();
    await service.enqueue(pendente);

    const stored = await service.getAll();
    expect(stored.length).toBe(1);
    expect(stored[0].id).toBe(pendente.id);
    expect(service.items().length).toBe(1);
    expect(service.pendingAulaIds().has(42)).toBeTrue();
  });

  it('remove item sincronizado da fila', async () => {
    const pendente = item();
    await service.enqueue(pendente);

    await service.remove(pendente.id);

    expect((await service.getAll()).length).toBe(0);
    expect(service.pendingAulaIds().has(42)).toBeFalse();
  });

  it('marca falha de regra de negócio como failed, fora do conjunto de pendentes', async () => {
    const pendente = item();
    await service.enqueue(pendente);

    await service.setStatus(pendente.id, 'failed', 'Limite semanal atingido');

    const stored = await service.getAll();
    expect(stored[0].status).toBe('failed');
    expect(stored[0].errorMessage).toBe('Limite semanal atingido');
    // failed não conta como pendente: estado otimista é revertido na UI
    expect(service.pendingAulaIds().has(42)).toBeFalse();
  });

  it('hasForAula ignora itens failed (permite novo check-in após falha)', async () => {
    const pendente = item();
    await service.enqueue(pendente);
    expect(service.hasForAula(42)).toBeTrue();

    await service.setStatus(pendente.id, 'failed');
    expect(service.hasForAula(42)).toBeFalse();
  });
});
