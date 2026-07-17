import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Aula } from '../../../core/models/aula.model';
import { CheckinApiService } from '../../../core/services/checkin-api.service';

@Component({
  selector: 'app-student-schedule',
  standalone: true,
  template: `
    <div>
      <h2 class="text-xl font-semibold text-brand-navy mb-4">Grade Semanal</h2>

      @if (message()) {
        <div class="mb-4 text-sm px-3 py-2 rounded-lg"
             [class]="messageType() === 'success' ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50'">
          {{ message() }}
        </div>
      }

      <div class="flex items-center justify-between mb-4">
        <button (click)="prevWeek()" class="text-brand-blue text-sm hover:underline">← Anterior</button>
        <span class="text-sm font-medium text-gray-700">{{ weekLabel }}</span>
        <button (click)="nextWeek()" class="text-brand-blue text-sm hover:underline">Proxima →</button>
      </div>

      @for (day of weekDays; track day.date) {
        <div class="mb-4">
          <h3 class="text-sm font-medium text-gray-500 mb-2">{{ day.label }}</h3>
          @if (getAulasForDate(day.date).length === 0) {
            <p class="text-xs text-gray-400 ml-2">Sem aulas</p>
          } @else {
            <div class="space-y-2">
              @for (aula of getAulasForDate(day.date); track aula.id) {
                <div class="bg-white rounded-lg shadow-sm p-3 flex items-center justify-between"
                     [class.opacity-50]="aula.cancelada">
                  <div>
                    <p class="font-medium text-gray-900 text-sm">{{ aula.turmaNome ?? 'Avulsa' }}</p>
                    <p class="text-xs text-gray-500">{{ aula.horaInicio }} - {{ aula.horaFim }} | Prof. {{ aula.professorNome }}</p>
                  </div>
                  <div class="text-right flex items-center gap-2">
                    @if (aula.cancelada) {
                      <span class="text-red-500 text-xs">Cancelada</span>
                    } @else {
                      <span class="text-xs" [class]="aula.vagasDisponiveis > 0 ? 'text-green-600' : 'text-orange-500'">
                        {{ aula.vagasDisponiveis }} vagas
                      </span>
                      @if (isToday(day.date) && !checkinMap().has(aula.id)) {
                        <button (click)="checkin(aula)" class="bg-brand-blue text-white px-3 py-1 rounded text-xs hover:bg-brand-blue/90">
                          Check-in
                        </button>
                      }
                      @if (checkinMap().has(aula.id)) {
                        <span class="text-green-600 text-xs font-medium">Presente</span>
                        @if (isToday(day.date)) {
                          <button (click)="cancelCheckin(aula)" class="text-red-500 text-xs hover:underline">
                            Desfazer
                          </button>
                        }
                      }
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class StudentScheduleComponent implements OnInit {
  aulas = signal<Aula[]>([]);
  checkinMap = signal<Map<number, number>>(new Map()); // aulaId -> checkinId
  message = signal('');
  messageType = signal<'success' | 'error'>('success');
  weekStart = this.getMonday(new Date());
  weekDays: { date: string; label: string }[] = [];
  weekLabel = '';
  today = this.formatDate(new Date());

  constructor(private http: HttpClient, private checkinApi: CheckinApiService) {}

  ngOnInit() {
    this.updateWeek();
    this.loadCheckins();
  }

  prevWeek() {
    this.weekStart.setDate(this.weekStart.getDate() - 7);
    this.updateWeek();
  }

  nextWeek() {
    this.weekStart.setDate(this.weekStart.getDate() + 7);
    this.updateWeek();
  }

  updateWeek() {
    const start = this.formatDate(this.weekStart);
    const dayNames = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado', 'Domingo'];
    this.weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.weekStart);
      d.setDate(d.getDate() + i);
      return { date: this.formatDate(d), label: `${dayNames[i]} ${d.getDate()}/${d.getMonth() + 1}` };
    });
    this.weekLabel = `${this.weekDays[0].date} a ${this.weekDays[6].date}`;

    this.http.get<Aula[]>(`${environment.apiUrl}/aulas/semana?inicio=${start}`)
      .subscribe(data => this.aulas.set(data));
  }

  checkin(aula: Aula) {
    this.message.set('');
    this.checkinApi.checkin(aula.id).subscribe({
      next: (res) => {
        const status = res.status === 'LISTA_ESPERA' ? 'Voce entrou na lista de espera' : 'Check-in realizado com sucesso!';
        this.message.set(status);
        this.messageType.set('success');
        this.checkinMap.update(map => new Map(map).set(aula.id, res.id));
        this.updateWeek();
      },
      error: (err) => {
        this.message.set(err.error?.message || 'Erro ao realizar check-in.');
        this.messageType.set('error');
      }
    });
  }

  cancelCheckin(aula: Aula) {
    const checkinId = this.checkinMap().get(aula.id);
    if (!checkinId) return;
    this.http.delete(`${environment.apiUrl}/checkins/${checkinId}`).subscribe({
      next: () => {
        const updated = new Map(this.checkinMap());
        updated.delete(aula.id);
        this.checkinMap.set(updated);
        this.message.set('Check-in desfeito.');
        this.messageType.set('success');
        this.updateWeek();
      },
      error: (err) => {
        this.message.set(err.error?.message || 'Erro ao desfazer check-in.');
        this.messageType.set('error');
      }
    });
  }

  isToday(date: string): boolean {
    return date === this.today;
  }

  getAulasForDate(date: string): Aula[] {
    return this.aulas().filter(a => a.data === date);
  }

  private loadCheckins() {
    this.http.get<any[]>(`${environment.apiUrl}/checkins/historico`).subscribe(checkins => {
      const map = new Map<number, number>();
      checkins.filter(c => c.aulaData === this.today).forEach(c => map.set(c.aulaId, c.id));
      this.checkinMap.set(map);
    });
  }

  private getMonday(d: Date): Date {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
