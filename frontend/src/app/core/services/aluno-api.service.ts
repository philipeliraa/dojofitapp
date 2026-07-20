import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AlunoDetalhe, AlunoResumo } from '../models/aluno.model';

/**
 * Coaching de alunos (docs/02 §2). Leitura para equipe (Professor + Admin) —
 * suporta o fluxo de graduação. CRUD de usuários é separado (área Admin).
 */
@Injectable({ providedIn: 'root' })
export class AlunoApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/alunos`;

  listar(): Observable<AlunoResumo[]> {
    return this.http.get<AlunoResumo[]>(this.baseUrl);
  }

  detalhe(id: number): Observable<AlunoDetalhe> {
    return this.http.get<AlunoDetalhe>(`${this.baseUrl}/${id}`);
  }
}
