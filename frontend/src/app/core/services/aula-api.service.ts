import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Aula } from '../models/aula.model';

@Injectable({ providedIn: 'root' })
export class AulaApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/aulas`;

  getPorData(data: string) {
    return this.http.get<Aula[]>(`${this.baseUrl}?data=${data}`);
  }

  getSemana(inicio: string) {
    return this.http.get<Aula[]>(`${this.baseUrl}/semana?inicio=${inicio}`);
  }
}
