import { Component, computed, input } from '@angular/core';
import { CorFaixa } from '../../../core/models/progressao.model';

type Size = 'sm' | 'md' | 'lg';

/**
 * Nó de graduação (spec tela-inicio §2). Camada 2 (docs/04): faixa/grau do
 * atleta. **Único componente autorizado a consumir tokens belt.* ** (regra
 * não-negociável, docs/03/04) — a cor de graduação nunca se mistura à paleta de
 * marca.
 *
 * Composição: círculo neutro de fundo, duas tiras cruzadas (±22°) na cor da
 * faixa, uma ponta sobreposta (preta nas coloridas, vermelha na preta) com uma
 * tarja branca por grau, e um selo com o número do grau. `showLabel` acrescenta
 * o rótulo textual ao lado, para os usos em lista (perfil, gestão); o card de
 * identidade usa só o nó. Grau 0 mostra apenas as tiras (sem ponta nem selo).
 */
@Component({
  selector: 'dojofit-belt-badge',
  standalone: true,
  template: `
    <span class="inline-flex items-center gap-2">
      <svg
        [attr.width]="px()"
        [attr.height]="px()"
        viewBox="0 0 64 64"
        role="img"
        [attr.aria-label]="ariaLabel()"
      >
        <!-- Fundo neutro -->
        <circle cx="32" cy="32" r="31" [attr.fill]="surface" [attr.stroke]="border" stroke-width="1.5" />

        <!-- Tiras cruzadas na cor da faixa -->
        <g stroke-linejoin="round">
          <rect x="6" y="25" width="52" height="14" rx="7"
                [attr.fill]="strapFill()" [attr.stroke]="strapStroke()" stroke-width="1"
                transform="rotate(22 32 32)" />
          <rect x="6" y="25" width="52" height="14" rx="7"
                [attr.fill]="strapFill()" [attr.stroke]="strapStroke()" stroke-width="1"
                transform="rotate(-22 32 32)" />

          <!-- Ponta com tarjas de grau (só quando há grau) -->
          @if (degree() > 0) {
            <g transform="rotate(-22 32 32)">
              <rect [attr.x]="tipX()" y="25" [attr.width]="tipWidth()" height="14" rx="4"
                    [attr.fill]="tipColor()" />
              @for (x of stripeXs(); track x) {
                <rect [attr.x]="x" y="27.5" width="1.8" height="9" rx="0.9" [attr.fill]="surface" />
              }
            </g>
          }
        </g>

        <!-- Selo com o número do grau -->
        @if (degree() > 0) {
          <circle cx="48" cy="48" r="13" [attr.fill]="sealFill()" [attr.stroke]="sealStroke()" stroke-width="2.5" />
          <text x="48" y="48" text-anchor="middle" dominant-baseline="central"
                font-size="15" font-weight="700" [attr.fill]="sealTextColor()">{{ degree() }}</text>
        }
      </svg>

      @if (showLabel()) {
        <span class="inline-flex items-center gap-1 text-caption font-sans font-medium text-primary">
          {{ nomeFaixa() }}
          @if (degree() > 0) {
            <span>· {{ degree() }}º grau</span>
          }
          @if (modality()) {
            <span class="text-secondary">· {{ modality() }}</span>
          }
        </span>
      }
    </span>
  `,
})
export class DojofitBeltBadgeComponent {
  beltColor = input.required<CorFaixa>();
  degree = input(0);
  size = input<Size>('md');
  showLabel = input(false);
  modality = input<string>();

  // Tokens neutros do nó (não são belt.*): fundo e borda do sistema base.
  protected readonly surface = 'var(--color-surface-base)';
  protected readonly border = 'var(--color-default)';

  private static readonly nomes: Record<CorFaixa, string> = {
    BRANCA: 'Branca',
    AZUL: 'Azul',
    ROXA: 'Roxa',
    MARROM: 'Marrom',
    PRETA: 'Preta',
  };

  private static readonly tokens: Record<CorFaixa, string> = {
    BRANCA: 'var(--color-belt-branca)',
    AZUL: 'var(--color-belt-azul)',
    ROXA: 'var(--color-belt-roxa)',
    MARROM: 'var(--color-belt-marrom)',
    PRETA: 'var(--color-belt-preta)',
  };

  private static readonly pxPorTamanho: Record<Size, number> = { sm: 32, md: 44, lg: 64 };

  protected readonly nomeFaixa = computed(() => DojofitBeltBadgeComponent.nomes[this.beltColor()]);
  protected readonly px = computed(() => DojofitBeltBadgeComponent.pxPorTamanho[this.size()]);
  protected readonly strapFill = computed(() => DojofitBeltBadgeComponent.tokens[this.beltColor()]);

  // Só a faixa branca precisa de borda de contraste sobre o fundo claro (docs/03).
  protected readonly strapStroke = computed(() =>
    this.beltColor() === 'BRANCA' ? 'var(--color-belt-branca-borda)' : 'none');

  // Ponta preta nas coloridas; vermelha de graduação na preta (spec §2).
  protected readonly tipColor = computed(() =>
    this.beltColor() === 'PRETA' ? 'var(--color-belt-preta-ponta)' : 'var(--color-belt-preta)');

  protected readonly sealFill = computed(() => this.strapFill());
  protected readonly sealStroke = computed(() =>
    this.beltColor() === 'BRANCA' ? 'var(--color-belt-branca-borda)' : this.surface);
  protected readonly sealTextColor = computed(() =>
    this.beltColor() === 'BRANCA' ? 'var(--color-primary)' : this.surface);

  // Ponta cresce para acomodar uma tarja por grau (spec §2): não trava em 4.
  protected readonly tipWidth = computed(() => 6 + this.degree() * 4);
  protected readonly tipX = computed(() => 56 - this.tipWidth());
  protected readonly stripeXs = computed(() =>
    Array.from({ length: this.degree() }, (_, i) => this.tipX() + 3 + i * 4));

  protected readonly ariaLabel = computed(() => {
    const grau = this.degree() > 0 ? ` ${this.degree()}º grau` : '';
    const mod = this.modality() ? ` · ${this.modality()}` : '';
    return `Faixa ${this.nomeFaixa()}${grau}${mod}`;
  });
}
