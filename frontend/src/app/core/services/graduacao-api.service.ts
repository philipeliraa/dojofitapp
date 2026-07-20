import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Faixa, Graduacao, Modalidade } from '../models/graduacao.model';
import { Progressao } from '../models/progressao.model';

export interface ConcederGraduacaoRequest {
  alunoId: number;
  modalidadeId: number;
  faixaId: number;
  grau: number;
  data: string;
  observacao?: string;
}

/**
 * Concessão e consulta de graduação para a equipe (docs/06 fluxo 3). Concessão
 * é ação online e deliberada — sem UUID de fila offline (como o Mural).
 */
@Injectable({ providedIn: 'root' })
export class GraduacaoApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  modalidades(): Observable<Modalidade[]> {
    return this.http.get<Modalidade[]>(`${this.baseUrl}/modalidades`);
  }

  faixas(modalidadeId: number): Observable<Faixa[]> {
    return this.http.get<Faixa[]>(`${this.baseUrl}/modalidades/${modalidadeId}/faixas`);
  }

  conceder(req: ConcederGraduacaoRequest): Observable<Graduacao> {
    return this.http.post<Graduacao>(`${this.baseUrl}/graduacoes`, req);
  }

  progressaoDoAluno(alunoId: number): Observable<Progressao[]> {
    return this.http.get<Progressao[]>(`${this.baseUrl}/alunos/${alunoId}/progressao`);
  }

  historicoDoAluno(alunoId: number): Observable<Graduacao[]> {
    return this.http.get<Graduacao[]>(`${this.baseUrl}/alunos/${alunoId}/graduacoes`);
  }
}
