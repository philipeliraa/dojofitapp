// jsdom não implementa IndexedDB — a fila offline (docs/07 seção 8) depende
// de um IndexedDB real nos testes, daí o polyfill antes de tudo.
import 'fake-indexeddb/auto';

import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

// jsdom não expõe crypto.randomUUID (usado no UUID client-side do check-in, docs/07 seção 6)
import { randomUUID } from 'node:crypto';

if (typeof globalThis.crypto.randomUUID !== 'function') {
  Object.defineProperty(globalThis.crypto, 'randomUUID', {
    value: randomUUID,
    configurable: true,
  });
}

// jsdom não expõe structuredClone — usado internamente pelo fake-indexeddb.
// Os itens da fila offline são objetos simples (id/aulaId/timestamp/status),
// então um clone via JSON é suficiente para os testes.
if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
}
