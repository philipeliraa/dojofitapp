import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Progressao } from '../models/progressao.model';

/**
 * Camada de API da progressão (docs/02, Fase 3a). Nesta etapa expõe a
 * progressão do próprio usuário (faixa/grau atual) para Início e Perfil.
 */
@Injectable({ providedIn: 'root' })
export class ProgressaoApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  minhaProgressao(): Observable<Progressao[]> {
    return this.http.get<Progressao[]>(`${this.baseUrl}/eu/progressao`);
  }
}
