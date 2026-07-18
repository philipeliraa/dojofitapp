import { Component, OnInit, effect, signal } from '@angular/core';
import { Aula } from '../../core/models/aula.model';
import { AulaApiService } from '../../core/services/aula-api.service';
import { CheckinSyncService } from '../../offline/checkin-sync.service';
import { CheckInService } from './checkin.service';
import { formatDateLocal } from '../../core/utils/data.util';
import { DojofitStreakCardComponent } from '../../shared/components/composed/dojofit-streak-card.component';
import { DojofitClassCardComponent } from '../../shared/components/composed/dojofit-class-card.component';
import { DojofitCheckInButtonComponent } from '../../shared/components/composed/dojofit-check-in-button.component';
import { DojofitBadgeComponent } from '../../shared/components/base/dojofit-badge.component';

/**
 * Início do Aluno (docs/02): jornada pessoal — streak semanal, aulas de
 * hoje e ação rápida de check-in. Consome o CheckInService único
 * (antes, essa lógica estava duplicada aqui e em CalendarioAlunoComponent).
 */
@Component({
  selector: 'app-inicio-aluno',
  standalone: true,
  imports: [DojofitStreakCardComponent, DojofitClassCardComponent, DojofitCheckInButtonComponent, DojofitBadgeComponent],
  template: `
    <div>
      <h2 class="mb-2 text-title text-primary">Aulas de Hoje</h2>
      <p class="mb-4 text-body text-secondary">{{ todayFormatted }}</p>

      @if (checkinService.streak(); as s) {
        <div class="mb-4">
          <dojofit-streak-card
            [weeklyStreak]="s.weeklyStreak"
            [averageSessionsPerWeek]="s.averagePerWeek"
            [contextualMessage]="s.contextualMessage"
          />
          @if (checkinService.weekInfo(); as w) {
            <div class="mt-2">
              <dojofit-badge>{{ w.count }}{{ w.limite ? ' / ' + w.limite : '' }} check-ins esta semana</dojofit-badge>
            </div>
          }
        </div>
      }

      @if (loading()) {
        <div class="py-8 text-center text-body text-secondary">Carregando...</div>
      } @else if (aulas().length === 0) {
        <div class="py-8 text-center text-body text-secondary">Nenhuma aula hoje</div>
      } @else {
        <div class="space-y-3">
          @for (aula of aulas(); track aula.id) {
            <dojofit-class-card
              [className]="aula.turmaNome ?? 'Aula Avulsa'"
              [time]="aula.horaInicio + ' - ' + aula.horaFim"
              [professorName]="aula.professorNome"
              [capacity]="{ current: aula.checkinsConfirmados, max: aula.capacidadeMaxima }"
              [cancelled]="aula.cancelada"
            >
              @if (checkinService.pendingAulaIds().has(aula.id)) {
                <div class="rounded-button border border-default bg-accent-blue-soft p-2 text-center">
                  <span class="text-body font-medium text-accent-blue-deep">⏱ Check-in pendente de sincronização</span>
                </div>
              } @else {
                <dojofit-check-in-button
                  [fullWidth]="true"
                  [state]="checkinService.estadoCheckInPara(aula.id)"
                  [loading]="checkingIn()"
                  (action)="onAction(aula.id)"
                />
              }
            </dojofit-class-card>
          }
        </div>
      }

      @if (message()) {
        <div class="fixed bottom-20 left-4 right-4 z-50 rounded-button p-3 text-center text-body font-medium"
             [class]="messageType() === 'success' ? 'bg-state-success text-white' : 'bg-brand-alert text-white'">
          {{ message() }}
        </div>
      }
    </div>
  `,
})
export class InicioAlunoComponent implements OnInit {
  aulas = signal<Aula[]>([]);
  loading = signal(true);
  checkingIn = signal(false);
  message = signal('');
  messageType = signal<'success' | 'error'>('success');
  todayFormatted = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  today = formatDateLocal(new Date());

  constructor(
    private aulaApi: AulaApiService,
    protected checkinService: CheckInService,
    checkinSync: CheckinSyncService,
  ) {
    // Reconciliação pós-sincronização (docs/05 seção 5): sucesso recarrega a
    // lista de aulas (CheckInService já recarrega o próprio resumo); falha
    // de regra de negócio reverte o estado otimista e notifica
    effect(() => {
      const result = checkinSync.lastResult();
      if (!result) return;
      if (result.ok) {
        this.refreshAulas();
      } else {
        this.showMessage(result.message ?? 'Check-in nao pode ser sincronizado', 'error');
      }
    });
  }

  ngOnInit() {
    this.aulaApi.getPorData(this.today).subscribe({
      next: data => { this.aulas.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.checkinService.carregarResumo();
  }

  /** dojofit-check-in-button emite o mesmo evento para "fazer check-in" e "desfazer" — o estado atual decide qual ação é essa. */
  onAction(aulaId: number) {
    const estado = this.checkinService.estadoCheckInPara(aulaId);
    if (estado === 'checked-in' || estado === 'waitlisted') {
      this.cancelCheckin(aulaId);
    } else if (estado === 'available') {
      this.doCheckin(aulaId);
    }
  }

  doCheckin(aulaId: number) {
    this.checkingIn.set(true);
    this.checkinService.checkin(aulaId).subscribe({
      next: (outcome) => {
        this.checkingIn.set(false);

        if (outcome.kind === 'queued') {
          this.showMessage('Sem conexao — check-in salvo e sera sincronizado automaticamente.', 'success');
          return;
        }

        if (outcome.response.status === 'LISTA_ESPERA') {
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
    this.checkinService.cancelCheckin(aulaId).subscribe({
      next: () => {
        this.showMessage('Check-in desfeito.', 'success');
        this.refreshAulas();
      },
      error: (err) => {
        this.showMessage(err.error?.message || 'Erro ao desfazer check-in.', 'error');
      },
    });
  }

  private refreshAulas() {
    this.aulaApi.getPorData(this.today).subscribe(data => this.aulas.set(data));
  }

  private showMessage(text: string, type: 'success' | 'error') {
    this.message.set(text);
    this.messageType.set(type);
    setTimeout(() => this.message.set(''), 4000);
  }
}
