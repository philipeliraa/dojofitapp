import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RankingApiService } from '../../core/services/ranking-api.service';
import { AuthService } from '../../core/services/auth.service';
import { RankingItem } from '../../core/models/ranking.model';
import { DojofitCardComponent } from '../../shared/components/base/dojofit-card.component';

/**
 * Ranking da academia (docs/09 §9): frequência de treinos no mês corrente.
 * Tela própria (docs/01: o Início prioriza a jornada pessoal, não o ranking).
 * A linha do próprio usuário é destacada.
 */
@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [DojofitCardComponent],
  template: `
    <div>
      <h2 class="text-title text-primary">Ranking</h2>
      <p class="mb-4 text-body text-secondary">Treinos em {{ mesLabel }}</p>

      @if (carregando()) {
        <div class="space-y-2" aria-hidden="true">
          @for (i of [1, 2, 3, 4, 5]; track i) {
            <dojofit-card padding="sm" class="block">
              <div class="h-4 w-2/3 animate-pulse rounded-button bg-accent-blue-soft"></div>
            </dojofit-card>
          }
        </div>
      } @else if (ranking().length === 0) {
        <div class="py-12 text-center">
          <p class="mb-1 text-2xl" aria-hidden="true">🏆</p>
          <p class="text-body text-secondary">Ninguém treinou este mês ainda. Faça o primeiro check-in!</p>
        </div>
      } @else {
        <div class="space-y-2">
          @for (item of ranking(); track item.alunoId) {
            <dojofit-card padding="sm" [class]="item.alunoId === meuId() ? 'block ring-2 ring-brand-blue' : 'block'">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <span class="w-7 text-center text-body font-medium text-secondary">
                    {{ medalha(item.posicao) || item.posicao + 'º' }}
                  </span>
                  <span class="text-body text-primary">
                    {{ item.alunoNome }}@if (item.alunoId === meuId()) { <span class="text-caption text-brand-blue"> (você)</span>}
                  </span>
                </div>
                <span class="shrink-0 text-caption text-secondary">{{ item.totalTreinos }} treino(s)</span>
              </div>
            </dojofit-card>
          }
        </div>
      }
    </div>
  `,
})
export class RankingComponent implements OnInit {
  private readonly api = inject(RankingApiService);
  private readonly authService = inject(AuthService);

  protected readonly ranking = signal<RankingItem[]>([]);
  protected readonly carregando = signal(true);
  protected readonly meuId = computed(() => this.authService.user()?.id ?? null);

  protected readonly mesLabel = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  ngOnInit() {
    this.api.listar().subscribe({
      next: (data) => {
        this.ranking.set(data);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  protected medalha(posicao: number): string {
    return posicao === 1 ? '🥇' : posicao === 2 ? '🥈' : posicao === 3 ? '🥉' : '';
  }
}
