import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { Aula } from '../../../core/models/aula.model';
import { Checkin } from '../../../core/models/checkin.model';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div>
      <h2 class="text-xl font-semibold text-brand-navy mb-4">Chamada</h2>

      <div class="space-y-2 mb-6">
        @for (aula of aulas(); track aula.id) {
          <button
            (click)="selectAula(aula)"
            class="w-full bg-white rounded-lg shadow-sm p-3 text-left hover:bg-gray-50 transition"
            [class.ring-2]="selectedAula()?.id === aula.id"
            [class.ring-brand-blue]="selectedAula()?.id === aula.id">
            <p class="font-medium text-gray-900 text-sm">{{ aula.turmaNome ?? 'Avulsa' }}</p>
            <p class="text-xs text-gray-500">{{ aula.horaInicio }} - {{ aula.horaFim }} | {{ aula.checkinsConfirmados }}/{{ aula.capacidadeMaxima }}</p>
          </button>
        }
        @if (aulas().length === 0) {
          <p class="text-gray-500 text-center py-4">Nenhuma aula hoje</p>
        }
      </div>

      @if (selectedAula()) {
        <div class="bg-white rounded-xl shadow-sm p-4">
          <h3 class="font-semibold text-gray-900 mb-3">
            {{ selectedAula()!.turmaNome }} - Presenca
          </h3>

          <!-- Manual check-in -->
          <div class="flex gap-2 mb-4">
            <input type="number" [(ngModel)]="manualAlunoId" placeholder="ID do aluno"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-blue" />
            <button (click)="manualCheckin()" class="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-blue/90">
              Check-in Manual
            </button>
          </div>

          <!-- Attendance list -->
          <div class="space-y-2">
            @for (checkin of checkins(); track checkin.id) {
              <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ checkin.alunoNome }}</p>
                  <p class="text-xs text-gray-500">{{ checkin.tipo === 'PROFESSOR' ? 'Manual' : 'Proprio' }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs px-2 py-1 rounded-full"
                        [class]="statusClass(checkin.status)">
                    {{ checkin.status }}
                  </span>
                  @if (checkin.status === 'LISTA_ESPERA') {
                    <button (click)="liberarExcecao(checkin.id)" class="text-xs text-brand-blue hover:underline">
                      Liberar
                    </button>
                  }
                </div>
              </div>
            }
            @if (checkins().length === 0) {
              <p class="text-gray-500 text-sm text-center py-2">Nenhum check-in</p>
            }
          </div>
        </div>

        @if (message()) {
          <div class="mt-3 p-3 rounded-lg text-center text-sm font-medium"
               [class]="messageType() === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
            {{ message() }}
          </div>
        }
      }
    </div>
  `,
})
export class AttendanceComponent implements OnInit {
  aulas = signal<Aula[]>([]);
  selectedAula = signal<Aula | null>(null);
  checkins = signal<Checkin[]>([]);
  manualAlunoId = '';
  message = signal('');
  messageType = signal<'success' | 'error'>('success');

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0];
    this.http.get<Aula[]>(`${environment.apiUrl}/aulas?data=${today}`).subscribe(data => this.aulas.set(data));
  }

  selectAula(aula: Aula) {
    this.selectedAula.set(aula);
    this.loadCheckins(aula.id);
  }

  loadCheckins(aulaId: number) {
    this.http.get<Checkin[]>(`${environment.apiUrl}/checkins/aula/${aulaId}`).subscribe(data => this.checkins.set(data));
  }

  manualCheckin() {
    if (!this.manualAlunoId || !this.selectedAula()) return;
    this.http.post<any>(`${environment.apiUrl}/checkins/manual`, {
      aulaId: this.selectedAula()!.id,
      alunoId: Number(this.manualAlunoId),
    }).subscribe({
      next: () => {
        this.showMessage('Check-in manual realizado', 'success');
        this.loadCheckins(this.selectedAula()!.id);
        this.manualAlunoId = '';
      },
      error: (err) => this.showMessage(err.error?.error ?? 'Erro', 'error'),
    });
  }

  liberarExcecao(checkinId: number) {
    this.http.post<any>(`${environment.apiUrl}/checkins/${checkinId}/excecao`, {}).subscribe({
      next: () => {
        this.showMessage('Excecao liberada', 'success');
        this.loadCheckins(this.selectedAula()!.id);
      },
      error: (err) => this.showMessage(err.error?.error ?? 'Erro', 'error'),
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

  private showMessage(text: string, type: 'success' | 'error') {
    this.message.set(text);
    this.messageType.set(type);
    setTimeout(() => this.message.set(''), 3000);
  }
}
