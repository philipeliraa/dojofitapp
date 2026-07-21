import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StatusTecnica, Tecnica, TecnicaAluno } from '../models/tecnica.model';

export interface TecnicaPayload {
  nome: string;
  descricao?: string;
}

/**
 * Técnicas (docs/09 §6). Catálogo por modalidade (escrita Admin) e status por
 * aluno (avaliação de coaching pela equipe; leitura própria pelo aluno).
 */
@Injectable({ providedIn: 'root' })
export class TecnicaApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // --- Catálogo ---
  listar(modalidadeId: number): Observable<Tecnica[]> {
    return this.http.get<Tecnica[]>(`${this.baseUrl}/modalidades/${modalidadeId}/tecnicas`);
  }

  criar(modalidadeId: number, payload: TecnicaPayload): Observable<Tecnica> {
    return this.http.post<Tecnica>(`${this.baseUrl}/modalidades/${modalidadeId}/tecnicas`, payload);
  }

  atualizar(modalidadeId: number, tecnicaId: number, payload: TecnicaPayload): Observable<Tecnica> {
    return this.http.put<Tecnica>(`${this.baseUrl}/modalidades/${modalidadeId}/tecnicas/${tecnicaId}`, payload);
  }

  deletar(modalidadeId: number, tecnicaId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/modalidades/${modalidadeId}/tecnicas/${tecnicaId}`);
  }

  // --- Status por aluno (coaching) ---
  doAluno(alunoId: number): Observable<TecnicaAluno[]> {
    return this.http.get<TecnicaAluno[]>(`${this.baseUrl}/alunos/${alunoId}/tecnicas`);
  }

  definirStatus(alunoId: number, tecnicaId: number, status: StatusTecnica): Observable<TecnicaAluno> {
    return this.http.put<TecnicaAluno>(`${this.baseUrl}/alunos/${alunoId}/tecnicas/${tecnicaId}`, { status });
  }

  remover(alunoId: number, tecnicaId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/alunos/${alunoId}/tecnicas/${tecnicaId}`);
  }

  // --- Leitura própria (Perfil) ---
  minhas(): Observable<TecnicaAluno[]> {
    return this.http.get<TecnicaAluno[]>(`${this.baseUrl}/eu/tecnicas`);
  }
}
