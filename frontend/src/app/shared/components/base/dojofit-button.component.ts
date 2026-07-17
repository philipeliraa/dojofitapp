import { Component, computed, input, output } from '@angular/core';

export type DojofitButtonVariant = 'primary' | 'secondary' | 'alert';
export type DojofitButtonSize = 'sm' | 'md';

/**
 * Camada 1 (docs/04 seção 2): botão base do Dojofit.
 * Cores só de docs/03 — nunca hex direto no template.
 */
@Component({
  selector: 'dojofit-button',
  standalone: true,
  template: `
    <button
      type="button"
      [class]="classes()"
      [disabled]="disabled() || loading()"
      (click)="handleClick()"
    >
      @if (loading()) {
        <span
          class="inline-block size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        ></span>
      }
      <ng-content />
    </button>
  `,
})
export class DojofitButtonComponent {
  variant = input<DojofitButtonVariant>('primary');
  size = input<DojofitButtonSize>('md');
  disabled = input(false);
  loading = input(false);

  onClick = output<void>();

  protected readonly classes = computed(() => {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-button font-sans transition ' +
      'disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue';

    // size (docs/04): md usa text.label (13px/500, "label de botão" em docs/03),
    // sm usa text.body (13px/400) — mesmo tamanho, peso mais leve
    const sizeClasses = this.size() === 'sm' ? 'py-2 px-4 text-body' : 'py-2.5 px-4.5 text-label';

    const variantClasses: Record<DojofitButtonVariant, string> = {
      primary: 'bg-brand-blue text-white hover:bg-brand-blue/90',
      secondary: 'bg-surface-base text-primary border border-strong hover:bg-accent-blue-soft',
      alert: 'bg-brand-alert text-white hover:bg-brand-alert/90',
    };

    return `${base} ${sizeClasses} ${variantClasses[this.variant()]}`;
  });

  protected handleClick(): void {
    if (this.disabled() || this.loading()) return;
    this.onClick.emit();
  }
}
