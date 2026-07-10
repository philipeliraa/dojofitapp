import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Checkin } from '../../../core/models/checkin.model';

@Component({
  selector: 'app-checkin-history',
  standalone: true,
  template: `
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Historico de Check-ins</h2>

      @if (loading()) {
        <div class="text-center py-8 text-gray-400">Carregando...</div>
      } @else if (checkins().length === 0) {
        <div class="text-center py-8 text-gray-500">Nenhum check-in registrado</div>
      } @else {
        <div class="space-y-2">
          @for (checkin of checkins(); track checkin.id) {
            <div class="bg-white rounded-lg shadow-sm p-3">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-gray-900 text-sm">{{ checkin.turmaNome }}</p>
                  <p class="text-xs text-gray-500">{{ checkin.aulaData }} | {{ checkin.aulaHoraInicio }}</p>
                </div>
                <div class="text-right">
                  <span class="text-xs px-2 py-1 rounded-full"
                        [class]="statusClass(checkin.status)">
                    {{ statusLabel(checkin.status) }}
                  </span>
                  <p class="text-xs text-gray-400 mt-1">{{ checkin.tipo === 'PROFESSOR' ? 'Manual' : 'Proprio' }}</p>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class CheckinHistoryComponent implements OnInit {
  checkins = signal<Checkin[]>([]);
  loading = signal(true);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<Checkin[]>(`${environment.apiUrl}/checkins/historico`).subscribe({
      next: data => { this.checkins.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  statusClass(status: string): string {
    switch (status) {
      case 'CONFIRMADO': return 'bg-green-100 text-green-700';
      case 'EXCECAO_LIBERADA': return 'bg-yellow-100 text-yellow-700';
      case 'LISTA_ESPERA': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'CONFIRMADO': return 'Confirmado';
      case 'EXCECAO_LIBERADA': return 'Excecao';
      case 'LISTA_ESPERA': return 'Lista Espera';
      default: return status;
    }
  }
}
