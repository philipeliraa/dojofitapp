import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Aula } from '../../../core/models/aula.model';
import { CheckinApiService } from '../../../core/services/checkin-api.service';

@Component({
  selector: 'app-student-home',
  standalone: true,
  template: `
    <div>
      <h2 class="text-xl font-semibold text-brand-navy mb-2">Aulas de Hoje</h2>
      <p class="text-sm text-gray-500 mb-4">{{ todayFormatted }}</p>

      @if (weekInfo()) {
        <div class="bg-brand-navy-light/20 border border-brand-navy-light rounded-lg p-3 mb-4 text-sm">
          Check-ins esta semana: <strong>{{ weekInfo()!.count }}</strong>{{ weekInfo()!.limite ? ' / ' + weekInfo()!.limite : '' }}
        </div>
      }

      @if (loading()) {
        <div class="text-center py-8 text-gray-400">Carregando...</div>
      } @else if (aulas().length === 0) {
        <div class="text-center py-8 text-gray-500">Nenhuma aula hoje</div>
      } @else {
        <div class="space-y-3">
          @for (aula of aulas(); track aula.id) {
            <div class="bg-white rounded-xl shadow-sm p-4" [class.opacity-50]="aula.cancelada">
              <div class="flex items-center justify-between mb-2">
                <div>
                  <h3 class="font-medium text-gray-900">{{ aula.turmaNome ?? 'Aula Avulsa' }}</h3>
                  <p class="text-sm text-gray-500">{{ aula.horaInicio }} - {{ aula.horaFim }}</p>
                  <p class="text-sm text-gray-500">Prof. {{ aula.professorNome }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm" [class]="aula.vagasDisponiveis > 0 ? 'text-green-600' : 'text-orange-500'">
                    {{ aula.vagasDisponiveis > 0 ? aula.vagasDisponiveis + ' vagas' : 'Lotada' }}
                  </p>
                  <p class="text-xs text-gray-400">{{ aula.checkinsConfirmados }}/{{ aula.capacidadeMaxima }}</p>
                </div>
              </div>

              @if (aula.cancelada) {
                <span class="text-red-500 text-sm font-medium">Aula Cancelada</span>
              } @else if (checkinMap().has(aula.id)) {
                <div class="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center justify-between">
                  <span class="text-green-700 text-sm font-medium">Check-in realizado!</span>
                  <button (click)="cancelCheckin(aula.id)"
                    class="text-brand-alert text-sm hover:underline">
                    Desfazer
                  </button>
                </div>
              } @else {
                <button
                  (click)="doCheckin(aula.id)"
                  [disabled]="checkingIn()"
                  class="w-full bg-brand-blue text-white py-3 rounded-lg font-medium text-lg hover:bg-brand-blue/90 disabled:opacity-50 transition active:scale-95">
                  {{ checkingIn() ? 'Confirmando...' : 'Fazer Check-in' }}
                </button>
              }
            </div>
          }
        </div>
      }

      @if (message()) {
        <div class="fixed bottom-20 left-4 right-4 p-3 rounded-lg text-center text-sm font-medium z-50"
             [class]="messageType() === 'success' ? 'bg-green-500 text-white' : 'bg-brand-alert text-white'">
          {{ message() }}
        </div>
      }
    </div>
  `,
})
export class StudentHomeComponent implements OnInit {
  aulas = signal<Aula[]>([]);
  loading = signal(true);
  checkingIn = signal(false);
  checkinMap = signal<Map<number, number>>(new Map()); // aulaId -> checkinId
  message = signal('');
  messageType = signal<'success' | 'error'>('success');
  weekInfo = signal<{ count: number; limite?: number } | null>(null);
  todayFormatted = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  today = new Date().toISOString().split('T')[0];

  constructor(private http: HttpClient, private checkinApi: CheckinApiService) {}

  ngOnInit() {
    this.http.get<Aula[]>(`${environment.apiUrl}/aulas?data=${this.today}`).subscribe({
      next: data => { this.aulas.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.loadCheckins();
    this.http.get<{ count: number }>(`${environment.apiUrl}/checkins/semana`).subscribe(data => this.weekInfo.set(data));
  }

  doCheckin(aulaId: number) {
    this.checkingIn.set(true);
    this.checkinApi.checkin(aulaId).subscribe({
      next: (res) => {
        this.checkingIn.set(false);
        const updated = new Map(this.checkinMap());
        updated.set(aulaId, res.id);
        this.checkinMap.set(updated);

        if (res.status === 'LISTA_ESPERA') {
          this.showMessage('Aula lotada. Voce entrou na lista de espera.', 'error');
        } else {
          this.showMessage('Check-in confirmado!', 'success');
        }
        this.refreshAulas();
      },
      error: (err) => {
        this.checkingIn.set(false);
        const msg = err.error?.message || err.error?.error || 'Erro ao fazer check-in';
        this.showMessage(msg, 'error');
      },
    });
  }

  cancelCheckin(aulaId: number) {
    const checkinId = this.checkinMap().get(aulaId);
    if (!checkinId) return;
    this.http.delete(`${environment.apiUrl}/checkins/${checkinId}`).subscribe({
      next: () => {
        const updated = new Map(this.checkinMap());
        updated.delete(aulaId);
        this.checkinMap.set(updated);
        this.showMessage('Check-in desfeito.', 'success');
        this.refreshAulas();
      },
      error: (err) => {
        this.showMessage(err.error?.message || 'Erro ao desfazer check-in.', 'error');
      }
    });
  }

  private loadCheckins() {
    this.http.get<any[]>(`${environment.apiUrl}/checkins/historico`).subscribe(checkins => {
      const map = new Map<number, number>();
      checkins.filter(c => c.aulaData === this.today).forEach(c => map.set(c.aulaId, c.id));
      this.checkinMap.set(map);
    });
  }

  private refreshAulas() {
    this.http.get<Aula[]>(`${environment.apiUrl}/aulas?data=${this.today}`).subscribe(data => this.aulas.set(data));
    this.http.get<{ count: number }>(`${environment.apiUrl}/checkins/semana`).subscribe(data => this.weekInfo.set(data));
  }

  private showMessage(text: string, type: 'success' | 'error') {
    this.message.set(text);
    this.messageType.set(type);
    setTimeout(() => this.message.set(''), 4000);
  }
}
