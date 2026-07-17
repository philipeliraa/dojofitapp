import { Component, computed, input } from '@angular/core';

export type DojofitAvatarSize = 'sm' | 'md';

/**
 * Camada 1 (docs/04 seção 2): iniciais do usuário como fallback sem foto.
 * accent.blue-soft/deep — mesmo par documentado em docs/03 seção 2 para
 * fundo de avatar/badge.
 */
@Component({
  selector: 'dojofit-avatar',
  standalone: true,
  template: `<span [class]="classes()">{{ initials() }}</span>`,
})
export class DojofitAvatarComponent {
  initials = input.required<string>();
  size = input<DojofitAvatarSize>('md');

  protected readonly classes = computed(() => {
    const sizeClasses = this.size() === 'sm' ? 'size-7 text-caption' : 'size-9 text-label';
    return `inline-flex items-center justify-center rounded-full bg-accent-blue-soft text-accent-blue-deep font-sans ${sizeClasses}`;
  });
}
