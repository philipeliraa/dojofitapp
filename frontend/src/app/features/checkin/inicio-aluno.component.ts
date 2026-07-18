import { Component, OnInit, effect, signal } from '@angular/core';
import { Aula } from '../../core/models/aula.model';
import { AulaApiService } from '../../core/services/aula-api.service';
import { CheckinSyncService } from '../../offline/checkin-sync.service';
import { CheckInService } from './checkin.service';
import { formatDateLocal } from '../../core/utils/data.util';
import { DojofitCardComponent } from '../../shared/components/base/dojofit-card.component';
import { DojofitButtonComponent } from '../../shared/components/base/dojofit-button.component';
import { DojofitBadgeComponent } from '../../shared/components/base/dojofit-badge.component';

/**
 * Início do Aluno (docs/02): jornada pessoal — streak semanal, aulas de
 * hoje e ação rápida de check-in. Consome o CheckInService único
 * (antes, essa lógica estava duplicada aqui e em CalendarioAlunoComponent).
 */
@Component({
  selector: 'app-inicio-aluno',
  standalone: true,
  imports: [DojofitCardComponent, DojofitButtonComponent, DojofitBadgeComponent],
  template: `
    <div>
      <h2 class="mb-2 text-title text-primary">Aulas de Hoje</h2>
      <p class="mb-4 text-body text-secondary">{{ todayFormatted }}</p>

      @if (checkinService.streak(); as s) {
        <dojofit-card>
          <div class="mb-1 flex items-center justify-between">
            <span class="text-display text-primary">
              {{ s.weeklyStreak }} {{ s.weeklyStreak === 1 ? 'semana' : 'semanas' }}
            </span>
            @if (checkinService.weekInfo(); as w) {
              <dojofit-badge>{{ w.count }}{{ w.limite ? ' / ' + w.limite : '' }} esta semana</dojofit-badge>
            }
          </div>
          <p class="text-body text-secondary">{{ s.contextualMessage }}</p>
        </dojofit-card>
        <div class="mb-4"></div>
      }

      @if (loading()) {
        <div class="py-8 text-center text-body text-secondary">Carregando...</div>
      } @else if (aulas().length === 0) {
        <div class="py-8 text-center text-body text-secondary">Nenhuma aula hoje</div>
      } @else {
        <div class="space-y-3">
          @for (aula of aulas(); track aula.id) {
            <dojofit-card [class.opacity-50]="aula.cancelada">
              <div class="mb-2 flex items-center justify-between">
                <div>
                  <h3 class="text-heading text-primary">{{ aula.turmaNome ?? 'Aula Avulsa' }}</h3>
                  <p class="text-body text-secondary">{{ aula.horaInicio }} - {{ aula.horaFim }}</p>
                  <p class="text-body text-secondary">Prof. {{ aula.professorNome }}</p>
                </div>
                <div class="text-right">
                  <p class="text-body" [class]="aula.vagasDisponiveis > 0 ? 'text-state-success' : 'text-brand-alert'">
                    {{ aula.vagasDisponiveis > 0 ? aula.vagasDisponiveis + ' vagas' : 'Lotada' }}
                  </p>
                  <p class="text-caption text-secondary">{{ aula.checkinsConfirmados }}/{{ aula.capacidadeMaxima }}</p>
                </div>
              </div>

              @if (aula.cancelada) {
                <span class="text-body font-medium text-brand-alert">Aula Cancelada</span>
              } @else if (checkinService.pendingAulaIds().has(aula.id)) {
                <div class="rounded-button border border-default bg-accent-blue-soft p-2 text-center">
                  <span class="text-body font-medium text-accent-blue-deep">⏱ Check-in pendente de sincronização</span>
                </div>
              } @else if (checkinService.checkinIdPorAulaHoje().has(aula.id)) {
                <div class="flex items-center justify-between rounded-button border border-default bg-state-success-soft p-2">
                  <span class="text-body font-medium text-state-success-deep">Check-in realizado!</span>
                  <dojofit-button variant="alert" size="sm" (onClick)="cancelCheckin(aula.id)">Desfazer</dojofit-button>
                </div>
              } @else {
                <dojofit-button [fullWidth]="true" [loading]="checkingIn()" (onClick)="doCheckin(aula.id)">
                  Fazer Check-in
                </dojofit-button>
              }
            </dojofit-card>
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
