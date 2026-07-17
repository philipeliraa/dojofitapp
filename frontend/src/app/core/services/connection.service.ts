import { Injectable, signal } from '@angular/core';

/**
 * Status de conexão — parte do estado global mínimo de core/ (docs/07 seção 5),
 * consumido pelo módulo offline/ e pelo banner de conexão (docs/05 seção 5).
 */
@Injectable({ providedIn: 'root' })
export class ConnectionService {
  private readonly _online = signal(navigator.onLine);
  readonly online = this._online.asReadonly();

  constructor() {
    window.addEventListener('online', () => this._online.set(true));
    window.addEventListener('offline', () => this._online.set(false));
  }
}
