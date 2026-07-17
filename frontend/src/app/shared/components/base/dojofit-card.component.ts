import { Component, computed, input } from '@angular/core';

export type DojofitCardPadding = 'sm' | 'md';

/**
 * Camada 1 (docs/04 seção 2): container base — surface.base, border.default,
 * radius.card, sem sombra (elevação por borda, docs/03 seção 6).
 */
@Component({
  selector: 'dojofit-card',
  standalone: true,
  template: `
    <div [class]="classes()">
      <ng-content />
    </div>
  `,
})
export class DojofitCardComponent {
  padding = input<DojofitCardPadding>('md');

  protected readonly classes = computed(() => {
    const paddingClass = this.padding() === 'sm' ? 'p-3' : 'p-4';
    return `bg-surface-base border border-default rounded-card ${paddingClass}`;
  });
}
