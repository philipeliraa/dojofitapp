import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RankingItem } from '../models/ranking.model';

/**
 * Ranking da academia (docs/09 §9): lista do mês corrente por frequência de
 * treinos.
 */
@Injectable({ providedIn: 'root' })
export class RankingApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/ranking`;

  listar(): Observable<RankingItem[]> {
    return this.http.get<RankingItem[]>(this.baseUrl);
  }
}
