import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Flame, TrendingUp, TicketCheck, CalendarClock, MessageSquareQuote, CircleCheck, Clock, Trophy, Medal } from 'lucide-angular';
import { Aula } from '../../core/models/aula.model';
import { AulaApiService } from '../../core/services/aula-api.service';
import { CheckinSyncService } from '../../offline/checkin-sync.service';
import { CheckInService } from './checkin.service';
import { formatDateLocal } from '../../core/utils/data.util';
import { DojofitClassCardComponent } from '../../shared/components/composed/dojofit-class-card.component';
import { DojofitCheckInButtonComponent } from '../../shared/components/composed/dojofit-check-in-button.component';
import { DojofitCardComponent } from '../../shared/components/base/dojofit-card.component';
import { DojofitIdentityCardComponent } from '../../shared/components/composed/dojofit-identity-card.component';
import { ProgressaoApiService } from '../../core/services/progressao-api.service';
import { Progressao } from '../../core/models/progressao.model';
import { AuthService } from '../../core/services/auth.service';
import { RankingApiService } from '../../core/services/ranking-api.service';
import { RankingItem } from '../../core/models/ranking.model';
import { AvaliacaoApiService } from '../../core/services/avaliacao-api.service';
import { Avaliacao } from '../../core/models/avaliacao.model';

/**
 * Início do Aluno (spec tela-inicio): hub pessoal. Ordem dos blocos (§1): nome
 * da academia · card de identidade (nó de graduação + progresso) · data ·
 * carrossel de aulas · estatísticas · ranking + recomendações. Não há mais
 * saudação separada — o nome do aluno vive só dentro do card de identidade.
 * Consome o CheckInService único (docs/07 seção 5).
 */
@Component({
  selector: 'app-inicio-aluno',
  standalone: true,
  imports: [
    RouterLink,
    LucideAngularModule,
    DojofitClassCardComponent,
    DojofitCheckInButtonComponent,
    DojofitCardComponent,
    DojofitIdentityCardComponent,
  ],
  template: `
    <div class="space-y-4">
      <!-- Contexto de tenant (§4) -->
      @if (academiaNome(); as academia) {
        <p class="text-caption text-secondary">Academia <span class="font-medium text-primary">{{ academia }}</span></p>
      }

      <!-- Card de identidade (§3) -->
      @if (progressaoPrincipal(); as p) {
        <dojofit-identity-card [nome]="nome()" [progressao]="p" [checkinsExtra]="checkinOtimista()" />
      } @else if (!carregandoProgressao()) {
        <dojofit-card>
          <p class="text-body text-secondary">Sua jornada começa aqui. Sua primeira graduação aparecerá neste espaço.</p>
        </dojofit-card>
      }

      <!-- Data corrente -->
      <p class="text-body text-secondary">{{ dataFormatada }}</p>

      <!-- Carrossel de aulas do dia (§5) -->
      @if (carregandoAulas()) {
        <div class="py-8 text-center text-body text-secondary">Carregando...</div>
      } @else if (aulas().length === 0) {
        <div class="py-8 text-center text-body text-secondary">Nenhuma aula hoje</div>
      } @else {
        <div class="flex items-center gap-2">
          <lucide-icon [img]="ProximaAulaIcon" [size]="18" class="text-brand-blue" aria-hidden="true" />
          <h2 class="text-label text-primary">Próxima aula</h2>
        </div>
        <div class="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
          @for (aula of aulas(); track aula.id) {
            <div class="w-[85%] shrink-0 snap-start sm:w-72">
              <dojofit-class-card
                [className]="aula.turmaNome ?? 'Aula Avulsa'"
                [time]="aula.horaInicio + ' - ' + aula.horaFim"
                [professorName]="aula.professorNome"
                [capacity]="{ current: aula.checkinsConfirmados, max: aula.capacidadeMaxima }"
                [cancelled]="aula.cancelada"
              >
                @if (checkinService.estadoCheckInPara(aula.id) === 'checked-in') {
                  <!-- Estado check-in feito: selo verde + ver detalhes (sem submissão) -->
                  <div class="mb-2 flex items-center justify-center gap-1.5 rounded-button border px-3 py-2"
                       [style.border-color]="'var(--color-state-success)'"
                       [style.background]="'var(--color-state-success-soft)'">
                    <lucide-icon [img]="CheckinFeitoIcon" [size]="16" [style.color]="'var(--color-state-success-deep)'" aria-hidden="true" />
                    <span class="text-body font-medium" [style.color]="'var(--color-state-success-deep)'">Check-in feito</span>
                  </div>
                  <a routerLink="/perfil"
                     class="block rounded-button border border-default py-2 text-center text-body font-medium text-primary hover:bg-surface-body">
                    Ver detalhes do check-in
                  </a>
                } @else if (checkinService.pendingAulaIds().has(aula.id)) {
                  <div class="flex items-center justify-center gap-1.5 rounded-button border border-default bg-accent-blue-soft p-2">
                    <lucide-icon [img]="PendenteIcon" [size]="16" class="text-accent-blue-deep" aria-hidden="true" />
                    <span class="text-body font-medium text-accent-blue-deep">Check-in pendente de sincronização</span>
                  </div>
                } @else {
                  <dojofit-check-in-button
                    [fullWidth]="true"
                    [state]="checkinService.estadoCheckInPara(aula.id)"
                    [loading]="fazendoCheckin()"
                    (action)="onAction(aula.id)"
                  />
                }
              </dojofit-class-card>
            </div>
          }
        </div>
      }

      <!-- Estatísticas (§6) -->
      @if (checkinService.streak(); as s) {
        <div class="grid grid-cols-3 gap-3">
          <dojofit-card padding="sm" class="block">
            <div class="mb-1 flex items-center gap-1.5 text-secondary">
              <lucide-icon [img]="SequenciaIcon" [size]="16" aria-hidden="true" />
              <p class="text-caption">Sequência</p>
            </div>
            <p class="text-title text-primary">{{ s.weeklyStreak }}</p>
            <p class="text-caption text-secondary">{{ s.weeklyStreak === 1 ? 'semana' : 'semanas' }}</p>
          </dojofit-card>
          <dojofit-card padding="sm" class="block">
            <div class="mb-1 flex items-center gap-1.5 text-secondary">
              <lucide-icon [img]="MediaIcon" [size]="16" aria-hidden="true" />
              <p class="text-caption">Média</p>
            </div>
            <p class="text-title text-primary">{{ s.averagePerWeek }}</p>
            <p class="text-caption text-secondary">treinos/semana</p>
          </dojofit-card>
          <dojofit-card padding="sm" class="block">
            <div class="mb-1 flex items-center gap-1.5 text-secondary">
              <lucide-icon [img]="RestantesIcon" [size]="16" aria-hidden="true" />
              <p class="text-caption">Restantes</p>
            </div>
            <p class="text-title text-primary">{{ checkinsRestantes() }}</p>
            <p class="text-caption text-secondary">esta semana</p>
          </dojofit-card>
        </div>
      }

      <!-- Ranking + Recomendações (§7) -->
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <dojofit-card class="block">
          <h3 class="mb-2 flex items-center gap-1.5 text-label text-primary">
            <lucide-icon [img]="RankingIcon" [size]="16" class="text-brand-blue" aria-hidden="true" />
            Ranking da academia
          </h3>
          @if (topRanking().length === 0) {
            <p class="text-caption text-secondary">Ninguém treinou este mês ainda.</p>
          } @else {
            <div class="space-y-1">
              @for (item of topRanking(); track item.alunoId) {
                <div class="flex items-center justify-between gap-2"
                     [class.font-medium]="item.alunoId === meuId()">
                  <span class="flex min-w-0 items-center gap-1.5 text-body text-primary">
                    <lucide-icon [img]="PodioIcon" [size]="15" class="shrink-0 text-secondary" aria-hidden="true" />
                    <span class="truncate">{{ item.posicao }}º {{ item.alunoNome }}</span>@if (item.alunoId === meuId()) {<span class="shrink-0 text-caption text-brand-blue"> (você)</span>}
                  </span>
                  <span class="shrink-0 text-caption text-secondary">{{ item.totalTreinos }}</span>
                </div>
              }
              @if (minhaPosicaoForaDoTopo(); as eu) {
                <div class="mt-1 flex items-center justify-between gap-2 border-t border-default pt-1 font-medium">
                  <span class="truncate text-body text-primary">{{ eu.posicao }}º {{ eu.alunoNome }} <span class="text-caption text-brand-blue">(você)</span></span>
                  <span class="shrink-0 text-caption text-secondary">{{ eu.totalTreinos }}</span>
                </div>
              }
            </div>
          }
        </dojofit-card>

        <dojofit-card class="block">
          <h3 class="mb-2 flex items-center gap-1.5 text-label text-primary">
            <lucide-icon [img]="RecomendacoesIcon" [size]="16" class="text-brand-blue" aria-hidden="true" />
            Recomendações
          </h3>
          @if (recomendacoes().length === 0) {
            <p class="text-caption text-secondary">Sem recomendações do professor por enquanto.</p>
          } @else {
            <div class="space-y-2">
              @for (r of recomendacoes(); track r.id) {
                <div>
                  <p class="text-body text-primary">{{ r.conteudo }}</p>
                  <p class="text-caption text-secondary">— {{ r.autorNome }}</p>
                </div>
              }
            </div>
          }
        </dojofit-card>
      </div>

      @if (mensagem()) {
        <div class="fixed bottom-20 left-4 right-4 z-50 rounded-button p-3 text-center text-body font-medium"
             [class]="tipoMensagem() === 'success' ? 'bg-state-success text-white' : 'bg-brand-alert text-white'">
          {{ mensagem() }}
        </div>
      }
    </div>
  `,
})
export class InicioAlunoComponent implements OnInit {
  private readonly aulaApi = inject(AulaApiService);
  protected readonly checkinService = inject(CheckInService);
  private readonly progressaoApi = inject(ProgressaoApiService);
  private readonly authService = inject(AuthService);
  private readonly rankingApi = inject(RankingApiService);
  private readonly avaliacaoApi = inject(AvaliacaoApiService);

  // Ícones (lucide-angular, self-hosted). O nó de graduação segue SVG próprio.
  protected readonly ProximaAulaIcon = CalendarClock;
  protected readonly SequenciaIcon = Flame;
  protected readonly MediaIcon = TrendingUp;
  protected readonly RestantesIcon = TicketCheck;
  protected readonly RankingIcon = Trophy;
  protected readonly PodioIcon = Medal;
  protected readonly RecomendacoesIcon = MessageSquareQuote;
  protected readonly CheckinFeitoIcon = CircleCheck;
  protected readonly PendenteIcon = Clock;

  protected readonly aulas = signal<Aula[]>([]);
  protected readonly progressao = signal<Progressao[]>([]);
  protected readonly carregandoAulas = signal(true);
  protected readonly carregandoProgressao = signal(true);
  protected readonly fazendoCheckin = signal(false);
  protected readonly mensagem = signal('');
  protected readonly tipoMensagem = signal<'success' | 'error'>('success');
  /** Incremento otimista da barra de progresso ao check-in do dia (§3). */
  protected readonly checkinOtimista = signal(0);

  private readonly ranking = signal<RankingItem[]>([]);
  protected readonly recomendacoes = signal<Avaliacao[]>([]);

  protected readonly dataFormatada = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  private readonly hoje = formatDateLocal(new Date());

  protected readonly nome = computed(() => this.authService.user()?.nome ?? '');
  protected readonly academiaNome = computed(() => this.authService.user()?.academiaNome ?? null);
  protected readonly meuId = computed(() => this.authService.user()?.id ?? null);

  /** Fase 1a: modalidade de referência única — a primeira progressão graduada. */
  protected readonly progressaoPrincipal = computed<Progressao | null>(() => this.progressao()[0] ?? null);

  protected readonly checkinsRestantes = computed(() => {
    const w = this.checkinService.weekInfo();
    if (!w || w.limite == null) return '—';
    return Math.max(0, w.limite - w.count);
  });

  protected readonly topRanking = computed(() => this.ranking().slice(0, 3));
  protected readonly minhaPosicaoForaDoTopo = computed(() => {
    const eu = this.ranking().find(r => r.alunoId === this.meuId());
    return eu && eu.posicao > 3 ? eu : null;
  });

  constructor() {
    // Reconciliação pós-sincronização (docs/05 seção 5): sucesso recarrega
    // aulas e progressão; falha de regra reverte o otimista e notifica.
    const checkinSync = inject(CheckinSyncService);
    effect(() => {
      const result = checkinSync.lastResult();
      if (!result) return;
      if (result.ok) {
        this.refreshAulas();
        this.reloadProgressao();
      } else {
        this.checkinOtimista.set(0);
        this.mostrarMensagem(result.message ?? 'Check-in nao pode ser sincronizado', 'error');
      }
    });
  }

  ngOnInit() {
    this.aulaApi.getPorData(this.hoje).subscribe({
      next: data => { this.setAulas(data); this.carregandoAulas.set(false); },
      error: () => this.carregandoAulas.set(false),
    });
    this.checkinService.carregarResumo();
    this.reloadProgressao();
    this.rankingApi.listar().subscribe(r => this.ranking.set(r));
    // Recomendações/anotações do professor visíveis ao aluno (Fase 3d, §7).
    this.avaliacaoApi.minhas().subscribe(a =>
      this.recomendacoes.set(a.filter(x => x.tipo === 'RECOMENDACAO' || x.tipo === 'OBSERVACAO').slice(0, 2)),
    );
  }

  /** O botão emite o mesmo evento para check-in — o estado atual decide a ação. */
  onAction(aulaId: number) {
    if (this.checkinService.estadoCheckInPara(aulaId) === 'available') {
      this.fazerCheckin(aulaId);
    }
  }

  private fazerCheckin(aulaId: number) {
    this.fazendoCheckin.set(true);
    this.checkinService.checkin(aulaId).subscribe({
      next: (outcome) => {
        this.fazendoCheckin.set(false);
        this.checkinOtimista.update(n => n + 1); // barra reage imediatamente (§3)

        if (outcome.kind === 'queued') {
          this.mostrarMensagem('Sem conexao — check-in salvo e sera sincronizado automaticamente.', 'success');
          return; // offline: mantém o otimista até sincronizar
        }

        if (outcome.response.status === 'LISTA_ESPERA') {
          this.checkinOtimista.update(n => n - 1); // lista de espera não conta como treino
          this.mostrarMensagem('Aula lotada. Voce entrou na lista de espera.', 'error');
        } else {
          this.mostrarMensagem('Check-in confirmado!', 'success');
        }
        this.refreshAulas();
        this.reloadProgressao();
      },
      error: (err) => {
        this.fazendoCheckin.set(false);
        const msg = err.error?.message || err.error?.error || 'Erro ao fazer check-in';
        this.mostrarMensagem(msg, 'error');
      },
    });
  }

  private reloadProgressao() {
    this.progressaoApi.minhaProgressao().subscribe(p => {
      this.progressao.set(p);
      this.carregandoProgressao.set(false);
      // Progressão atualizada já contém o check-in — zera o incremento otimista.
      this.checkinOtimista.set(0);
    });
  }

  private refreshAulas() {
    this.aulaApi.getPorData(this.hoje).subscribe(data => this.setAulas(data));
  }

  /**
   * Aulas que já encerraram não aparecem no Início com opção de check-in
   * (docs/01: só no dia e enquanto acontece). O backend também rejeita.
   */
  private setAulas(data: Aula[]) {
    this.aulas.set(data.filter(a => !this.aulaJaEncerrou(a)));
  }

  private aulaJaEncerrou(aula: Aula): boolean {
    return new Date(`${aula.data}T${aula.horaFim}`).getTime() < Date.now();
  }

  private mostrarMensagem(text: string, type: 'success' | 'error') {
    this.mensagem.set(text);
    this.tipoMensagem.set(type);
    setTimeout(() => this.mensagem.set(''), 4000);
  }
}
