import { Injectable, computed, signal } from '@angular/core';
import { PendingCheckin } from './pending-checkin.model';

/**
 * Fila offline de check-in sobre IndexedDB NATIVO — sem Dexie.js ou similar,
 * decisão não-negociável de docs/07 seção 8. Um object store `pending-checkins`
 * com o UUID do check-in como chave.
 *
 * O estado em memória (Signals) espelha o store para a UI reagir; o IndexedDB
 * é a fonte de verdade que sobrevive a reload/fechamento do app.
 */
@Injectable({ providedIn: 'root' })
export class PendingCheckinQueueService {
  /** Sobrescrito em testes para isolar o banco. */
  dbName = 'dojofit-offline';

  private static readonly STORE = 'pending-checkins';
  private static readonly VERSION = 1;

  private readonly _items = signal<PendingCheckin[]>([]);
  readonly items = this._items.asReadonly();

  /** Aulas com check-in aguardando sincronização (exclui falhas definitivas). */
  readonly pendingAulaIds = computed(
    () => new Set(this._items().filter(i => i.status !== 'failed').map(i => i.aulaId)),
  );

  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    // Carrega itens deixados por sessões anteriores (fila sobrevive a reload)
    void this.refresh();
  }

  hasForAula(aulaId: number): boolean {
    return this._items().some(i => i.aulaId === aulaId && i.status !== 'failed');
  }

  findByAula(aulaId: number): PendingCheckin | undefined {
    return this._items().find(i => i.aulaId === aulaId && i.status !== 'failed');
  }

  async enqueue(item: PendingCheckin): Promise<void> {
    await this.write(store => store.put(item));
    await this.refresh();
  }

  async remove(id: string): Promise<void> {
    await this.write(store => store.delete(id));
    await this.refresh();
  }

  async setStatus(id: string, status: PendingCheckin['status'], errorMessage?: string): Promise<void> {
    const item = (await this.getAll()).find(i => i.id === id);
    if (!item) return;
    await this.write(store => store.put({ ...item, status, errorMessage }));
    await this.refresh();
  }

  getAll(): Promise<PendingCheckin[]> {
    return this.withStore('readonly', store => store.getAll() as IDBRequest<PendingCheckin[]>);
  }

  async clear(): Promise<void> {
    await this.write(store => store.clear());
    await this.refresh();
  }

  private async refresh(): Promise<void> {
    this._items.set(await this.getAll());
  }

  private write(action: (store: IDBObjectStore) => IDBRequest): Promise<unknown> {
    return this.withStore('readwrite', action);
  }

  private async withStore<T>(
    mode: IDBTransactionMode,
    action: (store: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> {
    const db = await this.openDb();
    return new Promise<T>((resolve, reject) => {
      const tx = db.transaction(PendingCheckinQueueService.STORE, mode);
      const request = action(tx.objectStore(PendingCheckinQueueService.STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private openDb(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, PendingCheckinQueueService.VERSION);
        request.onupgradeneeded = () => {
          if (!request.result.objectStoreNames.contains(PendingCheckinQueueService.STORE)) {
            request.result.createObjectStore(PendingCheckinQueueService.STORE, { keyPath: 'id' });
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    return this.dbPromise;
  }
}
