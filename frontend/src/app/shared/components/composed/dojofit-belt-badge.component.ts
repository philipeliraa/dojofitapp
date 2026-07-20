import { Component, computed, input } from '@angular/core';
import { CorFaixa } from '../../../core/models/progressao.model';

/**
 * Camada 2 (docs/04): faixa/grau do atleta. **Único componente autorizado a
 * consumir tokens belt.* ** (regra não-negociável, docs/03/04) — o sistema de
 * cor de graduação nunca se mistura à paleta de marca.
 *
 * Grau 0 mostra só a faixa (sem grau), como na convenção de graus do jiu-jitsu.
 */
@Component({
  selector: 'dojofit-belt-badge',
  standalone: true,
  template: `
    <span [class]="classes()">
      {{ nomeFaixa() }}
      @if (degree() > 0) {
        <span>· {{ degree() }}º grau</span>
      }
      @if (modality()) {
        <span class="opacity-75">· {{ modality() }}</span>
      }
    </span>
  `,
})
export class DojofitBeltBadgeComponent {
  beltColor = input.required<CorFaixa>();
  degree = input(0);
  modality = input<string>();

  private static readonly nomes: Record<CorFaixa, string> = {
    BRANCA: 'Branca',
    AZUL: 'Azul',
    ROXA: 'Roxa',
    MARROM: 'Marrom',
    PRETA: 'Preta',
  };

  // Faixa branca precisa de borda e texto escuro para aparecer sobre surface.base;
  // as demais têm contraste suficiente para texto branco (docs/03 seção 3).
  private static readonly estilos: Record<CorFaixa, string> = {
    BRANCA: 'bg-belt-branca text-primary border border-belt-branca-borda',
    AZUL: 'bg-belt-azul text-white',
    ROXA: 'bg-belt-roxa text-white',
    MARROM: 'bg-belt-marrom text-white',
    PRETA: 'bg-belt-preta text-white',
  };

  protected readonly nomeFaixa = computed(() => DojofitBeltBadgeComponent.nomes[this.beltColor()]);

  protected readonly classes = computed(() => {
    const base = 'inline-flex items-center gap-1 rounded-badge px-3 py-1 text-caption font-sans font-medium';
    return `${base} ${DojofitBeltBadgeComponent.estilos[this.beltColor()]}`;
  });
}
