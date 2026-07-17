import { Component, computed, input, model } from '@angular/core';

export type DojofitInputType = 'text' | 'email' | 'password' | 'number' | 'date';

/**
 * Camada 1 (docs/04 seção 2): campo de texto base do Dojofit.
 * Two-way binding via model() (Signals — docs/08 seção 4 regra 4):
 * usar [(value)], não [(ngModel)].
 */
@Component({
  selector: 'dojofit-input',
  standalone: true,
  template: `
    @if (label()) {
      <label [for]="inputId" class="mb-1 block text-label text-primary">{{ label() }}</label>
    }
    <input
      [id]="inputId"
      [type]="type()"
      [value]="value()"
      [disabled]="disabled()"
      (input)="value.set($any($event.target).value)"
      [class]="inputClasses()"
    />
    @if (error()) {
      <p class="mt-1 text-caption text-brand-alert-deep">{{ error() }}</p>
    }
  `,
})
export class DojofitInputComponent {
  private static nextId = 0;
  protected readonly inputId = `dojofit-input-${DojofitInputComponent.nextId++}`;

  label = input<string>();
  type = input<DojofitInputType>('text');
  error = input<string | null>(null);
  disabled = input(false);

  value = model('');

  protected readonly inputClasses = computed(() => {
    const base =
      'w-full rounded-button border bg-surface-base px-3 py-2 text-body text-primary outline-none transition ' +
      'disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-brand-blue';

    // Estado de erro (docs/03 seção 7): brand.alert na borda, mensagem abaixo
    const stateClasses = this.error() ? 'border-brand-alert' : 'border-default';

    return `${base} ${stateClasses}`;
  });
}
