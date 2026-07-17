import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Streak } from '../models/streak.model';

@Injectable({ providedIn: 'root' })
export class StreakApiService {
  private readonly http = inject(HttpClient);

  getStreak() {
    return this.http.get<Streak>(`${environment.apiUrl}/checkins/streak`);
  }
}
