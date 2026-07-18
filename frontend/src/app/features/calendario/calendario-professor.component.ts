import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Aula } from '../../core/models/aula.model';
import { AulaApiService } from '../../core/services/aula-api.service';
import { CheckInService } from '../checkin/checkin.service';
import { formatDateLocal } from '../../core/utils/data.util';
import { DojofitCardComponent } from '../../shared/components/base/dojofit-card.component';
import { DojofitButtonComponent } from '../../shared/components/base/dojofit-button.component';
import { DojofitBadgeComponent } from '../../shared/components/base/dojofit-badge.component';
import { DojofitInputComponent } from '../../shared/components/base/dojofit-input.component';

/**
 * Calendário do Professor/Admin (docs/02): grade semanal com override
 * manual do professor — antes só existia na Chamada (Início), separada
 * do Calendário. Consolidação da etapa 5.5: a aula de hoje pode ser
 * expandida para fazer check-in manual e liberar exceção, reaproveitando
 * o mesmo CheckInService da Chamada.
 */
@Component({
  selector: 'app-calendario-professor',
  standalone: true,
  imports: [FormsModule, DojofitCardComponent, DojofitButtonComponent, DojofitBadgeComponent, DojofitInputComponent],
  template: `
    <div>
      <h2 class="mb-4 text-title text-primary">Grade de Horários</h2>

      <div class="mb-4 flex items-center justify-between">
        <button (click)="prevWeek()" class="text-body text-brand-blue hover:underline">← Anterior</button>
        <span class="text-body font-medium text-primary">{{ weekLabel }}</span>
        <button (click)="nextWeek()" class="text-body text-brand-blue hover:underline">Proxima →</button>
      </div>

      @for (day of weekDays; track day.date) {
        <div class="mb-4">
          <h3 class="mb-2 text-body text-secondary">{{ day.label }}</h3>
          @if (getAulasForDate(day.date).length === 0) {
            <p class="ml-2 text-caption text-secondary">Sem aulas</p>
          } @else {
            <div class="space-y-2">
              @for (aula of getAulasForDate(day.date); track aula.id) {
                <dojofit-card padding="sm" [class.opacity-50]="aula.cancelada">
                  <button
                    class="flex w-full items-center justify-between text-left"
                    [disabled]="!isToday(day.date)"
                    (click)="toggleAula(aula)"
                  >
                    <div>
                      <p class="text-body font-medium text-primary">{{ aula.turmaNome ?? 'Avulsa' }}</p>
                      <p class="text-caption text-secondary">{{ aula.horaInicio }} - {{ aula.horaFim }}</p>
                    </div>
                    <span class="text-caption text-secondary">{{ aula.checkinsConfirmados }}/{{ aula.capacidadeMaxima }}</span>
                  </button>

                  @if (aulaAberta()?.id === aula.id) {
                    <div class="mt-3 border-t border-default pt-3">
                      <div class="mb-3 flex items-end gap-2">
                        <dojofit-input label="ID do aluno" type="number" [(value)]="manualAlunoId" />
                        <dojofit-button size="sm" (onClick)="manualCheckin()">Check-in Manual</dojofit-button>
                      </div>

                      <div class="space-y-2">
                        @for (checkin of checkinService.checkinsDaAula(); track checkin.id) {
                          <div class="flex items-center justify-between border-b border-default py-2 last:border-0">
                            <div>
                              <p class="text-body font-medium text-primary">{{ checkin.alunoNome }}</p>
                              <p class="text-caption text-secondary">{{ checkin.tipo === 'PROFESSOR' ? 'Manual' : 'Proprio' }}</p>
                            </div>
                            <div class="flex items-center gap-2">
                              <dojofit-badge [tone]="statusTone(checkin.status)">{{ statusLabel(checkin.status) }}</dojofit-badge>
                              @if (checkin.status === 'LISTA_ESPERA') {
                                <button (click)="liberarExcecao(checkin.id, aula.id)" class="text-caption text-brand-blue hover:underline">Liberar</button>
                              }
                            </div>
                          </div>
                        }
                        @if (checkinService.checkinsDaAula().length === 0) {
                          <p class="py-2 text-center text-body text-secondary">Nenhum check-in</p>
                        }
                      </div>
                    </div>
                  }
                </dojofit-card>
              }
            </div>
          }
        </div>
      }

      @if (message()) {
        <div class="mt-3 rounded-button p-3 text-center text-body font-medium"
             [class]="messageType() === 'success' ? 'bg-state-success-soft text-state-success-deep' : 'bg-brand-alert-soft text-brand-alert-deep'">
          {{ message() }}
        </div>
      }
    </div>
  `,
})
export class CalendarioProfessorComponent implements OnInit {
  aulas = signal<Aula[]>([]);
  aulaAberta = signal<Aula | null>(null);
  manualAlunoId = '';
  message = signal('');
  messageType = signal<'success' | 'error'>('success');
  weekStart = this.getMonday(new Date());
  weekDays: { date: string; label: string }[] = [];
  weekLabel = '';
  today = formatDateLocal(new Date());

  constructor(private aulaApi: AulaApiService, protected checkinService: CheckInService) {}

  ngOnInit() {
    this.updateWeek();
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
    const start = formatDateLocal(this.weekStart);
    const dayNames = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado', 'Domingo'];
    this.weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.weekStart);
      d.setDate(d.getDate() + i);
      return { date: formatDateLocal(d), label: `${dayNames[i]} ${d.getDate()}/${d.getMonth() + 1}` };
    });
    this.weekLabel = `${this.weekDays[0].date} a ${this.weekDays[6].date}`;
    this.aulaApi.getSemana(start).subscribe(data => this.aulas.set(data));
  }

  toggleAula(aula: Aula) {
    if (formatDateLocal(new Date()) !== this.today) return;
    if (this.aulaAberta()?.id === aula.id) {
      this.aulaAberta.set(null);
      return;
    }
    this.aulaAberta.set(aula);
    this.checkinService.carregarChecacksDaAula(aula.id);
  }

  manualCheckin() {
    const aula = this.aulaAberta();
    if (!this.manualAlunoId || !aula) return;
    this.checkinService.manualCheckin(aula.id, Number(this.manualAlunoId)).subscribe({
      next: () => {
        this.showMessage('Check-in manual realizado', 'success');
        this.manualAlunoId = '';
        this.updateWeek();
      },
      error: (err) => this.showMessage(err.error?.error ?? 'Erro', 'error'),
    });
  }

  liberarExcecao(checkinId: number, aulaId: number) {
    this.checkinService.liberarExcecao(checkinId, aulaId).subscribe({
      next: () => {
        this.showMessage('Excecao liberada', 'success');
        this.updateWeek();
      },
      error: (err) => this.showMessage(err.error?.error ?? 'Erro', 'error'),
    });
  }

  statusTone(status: string): 'neutral' | 'info' | 'alert' {
    switch (status) {
      case 'CONFIRMADO': return 'info';
      case 'LISTA_ESPERA': return 'alert';
      default: return 'neutral';
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

  isToday(date: string): boolean {
    return date === this.today;
  }

  getAulasForDate(date: string): Aula[] {
    return this.aulas().filter(a => a.data === date);
  }

  private showMessage(text: string, type: 'success' | 'error') {
    this.message.set(text);
    this.messageType.set(type);
    setTimeout(() => this.message.set(''), 3000);
  }

  private getMonday(d: Date): Date {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }
}
