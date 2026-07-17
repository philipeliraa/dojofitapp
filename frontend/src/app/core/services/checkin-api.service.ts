import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CheckinResponse {
  id: number;
  clientId: string;
  aulaId: number;
  alunoId: number;
  alunoNome: string;
  dataHoraCheckin: string;
  tipo: string;
  status: string;
  turmaNome: string;
  aulaData: string;
  aulaHoraInicio: string;
}

/**
 * Camada de API do check-in (docs/07 seção 6): toda escrita crítica gera um
 * UUID no cliente (crypto.randomUUID) e o envia como clientId — o backend
 * deduplica por esse UUID, tornando o reenvio (fila offline futura) seguro.
 */
@Injectable({ providedIn: 'root' })
export class CheckinApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/checkins`;

  checkin(aulaId: number, clientId: string = crypto.randomUUID()): Observable<CheckinResponse> {
    return this.http.post<CheckinResponse>(this.baseUrl, { aulaId, clientId });
  }

  manualCheckin(aulaId: number, alunoId: number, clientId: string = crypto.randomUUID()): Observable<CheckinResponse> {
    return this.http.post<CheckinResponse>(`${this.baseUrl}/manual`, { aulaId, alunoId, clientId });
  }
}
