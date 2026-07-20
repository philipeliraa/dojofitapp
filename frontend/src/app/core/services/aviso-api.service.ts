import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Aviso, FeedbackAviso } from '../models/aviso.model';

/**
 * Camada de API do Mural (docs/02 §4, Fase 2). Diferente do check-in, estas
 * escritas não são de fila offline — não geram UUID client-side (decisão desta
 * fase): publicar/comentar é ação online e deliberada.
 */
@Injectable({ providedIn: 'root' })
export class AvisoApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/avisos`;

  listar(): Observable<Aviso[]> {
    return this.http.get<Aviso[]>(this.baseUrl);
  }

  criar(titulo: string, conteudo: string): Observable<Aviso> {
    return this.http.post<Aviso>(this.baseUrl, { titulo, conteudo });
  }

  deletar(avisoId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${avisoId}`);
  }

  adicionarFeedback(avisoId: number, conteudo: string): Observable<FeedbackAviso> {
    return this.http.post<FeedbackAviso>(`${this.baseUrl}/${avisoId}/feedbacks`, { conteudo });
  }

  deletarFeedback(avisoId: number, feedbackId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${avisoId}/feedbacks/${feedbackId}`);
  }
}
