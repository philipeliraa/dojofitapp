import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Avaliacao, TipoAvaliacao } from '../models/avaliacao.model';

export interface AvaliacaoPayload {
  tipo: TipoAvaliacao;
  conteudo: string;
  publico: boolean;
}

/**
 * Avaliações do professor (docs/09 §8). Escrita/leitura completa pela equipe no
 * detalhe do aluno; o aluno lê apenas as próprias avaliações públicas (Perfil).
 */
@Injectable({ providedIn: 'root' })
export class AvaliacaoApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  doAluno(alunoId: number): Observable<Avaliacao[]> {
    return this.http.get<Avaliacao[]>(`${this.baseUrl}/alunos/${alunoId}/avaliacoes`);
  }

  registrar(alunoId: number, payload: AvaliacaoPayload): Observable<Avaliacao> {
    return this.http.post<Avaliacao>(`${this.baseUrl}/alunos/${alunoId}/avaliacoes`, payload);
  }

  atualizar(alunoId: number, avaliacaoId: number, payload: AvaliacaoPayload): Observable<Avaliacao> {
    return this.http.put<Avaliacao>(`${this.baseUrl}/alunos/${alunoId}/avaliacoes/${avaliacaoId}`, payload);
  }

  remover(alunoId: number, avaliacaoId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/alunos/${alunoId}/avaliacoes/${avaliacaoId}`);
  }

  minhas(): Observable<Avaliacao[]> {
    return this.http.get<Avaliacao[]>(`${this.baseUrl}/eu/avaliacoes`);
  }
}
