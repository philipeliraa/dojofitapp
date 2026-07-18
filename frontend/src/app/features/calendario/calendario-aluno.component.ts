import { Component, OnInit, effect, signal } from '@angular/core';
import { Aula } from '../../core/models/aula.model';
import { AulaApiService } from '../../core/services/aula-api.service';
import { CheckinSyncService } from '../../offline/checkin-sync.service';
import { CheckInService } from '../checkin/checkin.service';
import { formatDateLocal } from '../../core/utils/data.util';
import { DojofitClassCardComponent } from '../../shared/components/composed/dojofit-class-card.component';
import { DojofitCheckInButtonComponent } from '../../shared/components/composed/dojofit-check-in-button.component';

/**
 * Calendário do Aluno (docs/02): grade semanal com check-in do dia da
 * aula (docs/01). Consome o CheckInService único — antes duplicava a
 * mesma lógica de InicioAlunoComponent.
 */
@Component({
  selector: 'app-calendario-aluno',
  standalone: true,
  imports: [DojofitClassCardComponent, DojofitCheckInButtonComponent],
  template: `
    <div>
      <h2 class="mb-4 text-title text-primary">Grade Semanal</h2>

      @if (message()) {
        <div class="mb-4 rounded-button p-2 text-body"
             [class]="messageType() === 'success' ? 'bg-state-success-soft text-state-success-deep' : 'bg-brand-alert-soft text-brand-alert-deep'">
          {{ message() }}
        </div>
      }

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
                <dojofit-class-card
                  padding="sm"
                  [className]="aula.turmaNome ?? 'Avulsa'"
                  [time]="aula.horaInicio + ' - ' + aula.horaFim"
                  [professorName]="aula.professorNome"
                  [capacity]="{ current: aula.checkinsConfirmados, max: aula.capacidadeMaxima }"
                  [cancelled]="aula.cancelada"
                >
                  @if (isToday(day.date)) {
                    @if (checkinService.pendingAulaIds().has(aula.id)) {
                      <span class="text-caption font-medium text-accent-blue-deep">⏱ Pendente</span>
                    } @else {
                      <dojofit-check-in-button
                        size="sm"
                        [state]="checkinService.estadoCheckInPara(aula.id)"
                        (action)="onAction(aula)"
                      />
                    }
                  }
                </dojofit-class-card>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class CalendarioAlunoComponent implements OnInit {
  aulas = signal<Aula[]>([]);
  message = signal('');
  messageType = signal<'success' | 'error'>('success');
  weekStart = this.getMonday(new Date());
  weekDays: { date: string; label: string }[] = [];
  weekLabel = '';
  today = formatDateLocal(new Date());

  constructor(
    private aulaApi: AulaApiService,
    protected checkinService: CheckInService,
    checkinSync: CheckinSyncService,
  ) {
    // Reconciliação pós-sincronização (docs/05 seção 5) — mesmo padrão do
    // Início; faltava aqui antes da consolidação
    effect(() => {
      const result = checkinSync.lastResult();
      if (!result) return;
      if (result.ok) {
        this.updateWeek();
      } else {
        this.showMessage(result.message ?? 'Check-in nao pode ser sincronizado', 'error');
      }
    });
  }

  ngOnInit() {
    this.updateWeek();
    this.checkinService.carregarResumo();
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

  /** dojofit-check-in-button emite o mesmo evento para "fazer check-in" e "desfazer". */
  onAction(aula: Aula) {
    const estado = this.checkinService.estadoCheckInPara(aula.id);
    if (estado === 'checked-in' || estado === 'waitlisted') {
      this.cancelCheckin(aula);
    } else if (estado === 'available') {
      this.checkin(aula);
    }
  }

  checkin(aula: Aula) {
    this.message.set('');
    this.checkinService.checkin(aula.id).subscribe({
      next: (outcome) => {
        if (outcome.kind === 'queued') {
          this.showMessage('Sem conexao — check-in salvo e sera sincronizado automaticamente.', 'success');
          return;
        }
        const status = outcome.response.status === 'LISTA_ESPERA' ? 'Voce entrou na lista de espera' : 'Check-in realizado com sucesso!';
        this.showMessage(status, 'success');
        this.updateWeek();
      },
      error: (err) => {
        this.showMessage(err.error?.message || err.error?.error || 'Erro ao realizar check-in.', 'error');
      },
    });
  }

  cancelCheckin(aula: Aula) {
    this.checkinService.cancelCheckin(aula.id).subscribe({
      next: () => {
        this.showMessage('Check-in desfeito.', 'success');
        this.updateWeek();
      },
      error: (err) => {
        this.showMessage(err.error?.message || 'Erro ao desfazer check-in.', 'error');
      },
    });
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
  }

  private getMonday(d: Date): Date {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }
}
