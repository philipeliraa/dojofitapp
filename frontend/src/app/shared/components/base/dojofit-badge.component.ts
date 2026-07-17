import { Component, computed, input } from '@angular/core';

export type DojofitBadgeTone = 'neutral' | 'info' | 'alert';

/**
 * Camada 1 (docs/04 seção 2): status genérico (ex: "3x/semana").
 * Não usar para faixa/grau — isso é dojofit-belt-badge (Camada 2, Fase 3),
 * único componente autorizado a consumir tokens belt.* (regra não-negociável).
 */
@Component({
  selector: 'dojofit-badge',
  standalone: true,
  template: `
    <span [class]="classes()">
      @if (dot()) {
        <span [class]="dotClasses()" aria-hidden="true"></span>
      }
      <ng-content />
    </span>
  `,
})
export class DojofitBadgeComponent {
  tone = input<DojofitBadgeTone>('neutral');
  dot = input(false);

  protected readonly classes = computed(() => {
    const base = 'inline-flex items-center gap-1.5 rounded-badge px-2.5 py-1 text-caption font-sans';

    const toneClasses: Record<DojofitBadgeTone, string> = {
      neutral: 'bg-surface-base text-secondary border border-default',
      info: 'bg-accent-blue-soft text-accent-blue-deep',
      alert: 'bg-brand-alert-soft text-brand-alert-deep',
    };

    return `${base} ${toneClasses[this.tone()]}`;
  });

  protected readonly dotClasses = computed(() => {
    const dotColor: Record<DojofitBadgeTone, string> = {
      neutral: 'bg-secondary',
      info: 'bg-accent-blue-deep',
      alert: 'bg-brand-alert',
    };

    return `size-1.5 rounded-full ${dotColor[this.tone()]}`;
  });
}
