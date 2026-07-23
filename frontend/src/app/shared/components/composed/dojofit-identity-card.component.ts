import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, ChevronRight } from 'lucide-angular';
import { CorFaixa, Progressao } from '../../../core/models/progressao.model';
import { DojofitBeltBadgeComponent } from './dojofit-belt-badge.component';

/**
 * Card de identidade do Início (spec tela-inicio §3): compõe o nó de graduação
 * (dojofit-belt-badge) + dados do aluno + barra de progresso num único bloco
 * clicável que leva ao perfil.
 *
 * Regras da barra (§3): a fonte da verdade é `checkinsNoGrau` vs a meta
 * `checkinsNecessarios` do professor. Progresso é **indicativo** — nunca promove
 * (a decisão é do professor). O título é dinâmico: "Rumo ao Nº grau" no
 * intermediário, "Rumo à faixa X" no último grau. O contador reage ao check-in
 * do dia de forma otimista via `checkinsExtra`.
 *
 * Exceção de token: a barra usa a cor da faixa (belt.*), o que amplia a exceção
 * antes restrita ao belt-badge. Decisão explícita do Philipe nesta sessão
 * (spec §3 pede a cor da faixa na barra) — registrar em docs/03/04.
 */
@Component({
  selector: 'dojofit-identity-card',
  standalone: true,
  imports: [DojofitBeltBadgeComponent, LucideAngularModule],
  template: `
    <div
      role="button"
      tabindex="0"
      (click)="abrirPerfil()"
      (keydown.enter)="abrirPerfil()"
      (keydown.space)="abrirPerfil($event)"
      class="w-full cursor-pointer rounded-card border border-default bg-surface-base p-4 text-left transition-shadow hover:shadow-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
      [attr.aria-label]="'Abrir meu perfil — ' + nome()"
    >
      <div class="flex items-center gap-3">
        <dojofit-belt-badge [beltColor]="progressao().cor" [degree]="progressao().grau" size="lg" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-title text-primary">{{ nome() }}</p>
          <p class="truncate text-caption text-secondary">Faixa {{ progressao().faixaNome }} · {{ progressao().modalidadeNome }}</p>
        </div>
        <lucide-icon [img]="ChevronRightIcon" [size]="20" class="text-strong" aria-hidden="true" />
      </div>

      <hr class="my-3 border-default" />

      <div>
        <div class="mb-1 flex items-baseline justify-between gap-2">
          <span class="text-label text-primary">{{ titulo() }}</span>
          <span class="text-caption text-secondary">{{ contador() }}</span>
        </div>

        <div class="h-2 w-full overflow-hidden rounded-full" [style.background]="'var(--color-default)'"
             role="progressbar" [attr.aria-valuenow]="checkinsAtuais()" aria-valuemin="0"
             [attr.aria-valuemax]="progressao().checkinsNecessarios" [attr.aria-label]="titulo()">
          <div class="h-full rounded-full transition-all duration-300" [style.width.%]="pct()" [style.background]="barColor()"></div>
        </div>

        <p class="mt-2 text-caption text-secondary">Indicativo · a promoção é sempre avaliada pelo professor</p>
      </div>
    </div>
  `,
})
export class DojofitIdentityCardComponent {
  nome = input.required<string>();
  progressao = input.required<Progressao>();
  /** Incremento otimista do check-in do dia, antes da confirmação do backend. */
  checkinsExtra = input(0);

  protected readonly ChevronRightIcon = ChevronRight;

  private readonly router = inject(Router);

  private static readonly tokens: Record<CorFaixa, string> = {
    // Branca usa a borda (o branco puro some sobre a trilha clara).
    BRANCA: 'var(--color-belt-branca-borda)',
    AZUL: 'var(--color-belt-azul)',
    ROXA: 'var(--color-belt-roxa)',
    MARROM: 'var(--color-belt-marrom)',
    PRETA: 'var(--color-belt-preta)',
  };

  protected readonly checkinsAtuais = computed(() =>
    this.progressao().checkinsNoGrau + this.checkinsExtra());

  protected readonly pct = computed(() => {
    const meta = this.progressao().checkinsNecessarios;
    if (!meta || meta <= 0) return 0;
    return Math.min(100, Math.round((this.checkinsAtuais() / meta) * 100));
  });

  protected readonly barColor = computed(() => DojofitIdentityCardComponent.tokens[this.progressao().cor]);

  private readonly ehUltimoGrau = computed(() => this.progressao().grau >= this.progressao().grausMax);

  protected readonly titulo = computed(() => {
    const p = this.progressao();
    if (this.ehUltimoGrau()) {
      return p.proximaFaixaNome ? `Rumo à faixa ${p.proximaFaixaNome}` : 'Última faixa da modalidade';
    }
    return `Rumo ao ${p.grau + 1}º grau`;
  });

  protected readonly contador = computed(() =>
    `${this.checkinsAtuais()} de ${this.progressao().checkinsNecessarios} check-ins`);

  protected abrirPerfil(event?: Event) {
    // Espaço rola a página por padrão — barra é conteúdo, não controle próprio (§3).
    event?.preventDefault();
    this.router.navigate(['/perfil']);
  }
}
