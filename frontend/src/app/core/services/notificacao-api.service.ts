import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notificacao } from '../models/notificacao.model';

/**
 * Notificações in-app do próprio usuário (docs/06 passo 8). Subsistema mínimo:
 * listar, contar não-lidas e marcar como lida.
 */
@Injectable({ providedIn: 'root' })
export class NotificacaoApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/notificacoes`;

  listar(): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(this.baseUrl);
  }

  contarNaoLidas(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/nao-lidas`);
  }

  marcarLida(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/lida`, {});
  }
}
