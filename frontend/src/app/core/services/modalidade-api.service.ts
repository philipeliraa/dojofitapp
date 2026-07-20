import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Faixa, Modalidade } from '../models/graduacao.model';
import { CorFaixa } from '../models/progressao.model';

export interface FaixaPayload {
  nome: string;
  cor: CorFaixa;
  ordem: number;
  grausMax: number;
}

/**
 * Configuração de modalidades e faixas (docs/09 §5). Leitura para todos;
 * escrita restrita ao Admin (garantida no backend por @PreAuthorize).
 */
@Injectable({ providedIn: 'root' })
export class ModalidadeApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/modalidades`;

  listar(): Observable<Modalidade[]> {
    return this.http.get<Modalidade[]>(this.baseUrl);
  }

  faixas(modalidadeId: number): Observable<Faixa[]> {
    return this.http.get<Faixa[]>(`${this.baseUrl}/${modalidadeId}/faixas`);
  }

  criarModalidade(nome: string): Observable<Modalidade> {
    return this.http.post<Modalidade>(this.baseUrl, { nome });
  }

  atualizarModalidade(id: number, nome: string): Observable<Modalidade> {
    return this.http.put<Modalidade>(`${this.baseUrl}/${id}`, { nome });
  }

  criarFaixa(modalidadeId: number, payload: FaixaPayload): Observable<Faixa> {
    return this.http.post<Faixa>(`${this.baseUrl}/${modalidadeId}/faixas`, payload);
  }

  atualizarFaixa(modalidadeId: number, faixaId: number, payload: FaixaPayload): Observable<Faixa> {
    return this.http.put<Faixa>(`${this.baseUrl}/${modalidadeId}/faixas/${faixaId}`, payload);
  }

  deletarFaixa(modalidadeId: number, faixaId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${modalidadeId}/faixas/${faixaId}`);
  }
}
