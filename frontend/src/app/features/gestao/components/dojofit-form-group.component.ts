import { Component, input } from '@angular/core';

/**
 * Camada 3 (docs/04 seção 4): agrupa campos (dojofit-input e outros) com
 * label de seção — usado em formulários de Alunos, Contratos, Turmas.
 */
@Component({
  selector: 'dojofit-form-group',
  standalone: true,
  template: `
    <div class="space-y-3">
      @if (label()) {
        <h3 class="text-heading text-primary">{{ label() }}</h3>
      }
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ng-content />
      </div>
    </div>
  `,
})
export class DojofitFormGroupComponent {
  label = input<string>();
}
