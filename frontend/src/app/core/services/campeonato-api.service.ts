import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Campeonato, ResultadoCampeonato } from '../models/campeonato.model';

export interface CampeonatoPayload {
  nome: string;
  data: string;
  resultado: ResultadoCampeonato;
  categoria?: string;
  observacao?: string;
}

/**
 * Campeonatos e medalhas (docs/09 §7). Registro pela equipe no detalhe do
 * aluno; leitura da própria linha do tempo pelo aluno (Perfil).
 */
@Injectable({ providedIn: 'root' })
export class CampeonatoApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  doAluno(alunoId: number): Observable<Campeonato[]> {
    return this.http.get<Campeonato[]>(`${this.baseUrl}/alunos/${alunoId}/campeonatos`);
  }

  registrar(alunoId: number, payload: CampeonatoPayload): Observable<Campeonato> {
    return this.http.post<Campeonato>(`${this.baseUrl}/alunos/${alunoId}/campeonatos`, payload);
  }

  atualizar(alunoId: number, campeonatoId: number, payload: CampeonatoPayload): Observable<Campeonato> {
    return this.http.put<Campeonato>(`${this.baseUrl}/alunos/${alunoId}/campeonatos/${campeonatoId}`, payload);
  }

  remover(alunoId: number, campeonatoId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/alunos/${alunoId}/campeonatos/${campeonatoId}`);
  }

  meus(): Observable<Campeonato[]> {
    return this.http.get<Campeonato[]>(`${this.baseUrl}/eu/campeonatos`);
  }
}
