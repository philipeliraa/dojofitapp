import { Component, input } from '@angular/core';
import { DojofitCardComponent } from '../base/dojofit-card.component';

export interface DojofitClassCapacity {
  current: number;
  max: number;
}

/**
 * Camada 2 (docs/04 seção 3): representa uma Aula (ocorrência de Turma)
 * no calendário. A ação de check-in (dojofit-check-in-button ou outra,
 * ex: override do professor) é projetada via ng-content — aula cancelada
 * some qualquer ação e mostra só o aviso.
 */
@Component({
  selector: 'dojofit-class-card',
  standalone: true,
  imports: [DojofitCardComponent],
  template: `
    <dojofit-card [padding]="padding()" [class.opacity-50]="cancelled()">
      <div class="flex items-center justify-between" [class.mb-2]="!cancelled()">
        <div>
          <h3 class="text-heading text-primary">{{ className() }}</h3>
          <p class="text-body text-secondary">{{ time() }}</p>
          @if (professorName()) {
            <p class="text-body text-secondary">Prof. {{ professorName() }}</p>
          }
        </div>
        @if (capacity(); as c) {
          <div class="text-right">
            <p class="text-body" [class]="c.max - c.current > 0 ? 'text-state-success' : 'text-brand-alert'">
              {{ c.max - c.current > 0 ? (c.max - c.current) + ' vagas' : 'Lotada' }}
            </p>
            <p class="text-caption text-secondary">{{ c.current }}/{{ c.max }}</p>
          </div>
        }
      </div>

      @if (cancelled()) {
        <span class="text-body font-medium text-brand-alert">Aula Cancelada</span>
      } @else {
        <ng-content />
      }
    </dojofit-card>
  `,
})
export class DojofitClassCardComponent {
  className = input.required<string>();
  time = input.required<string>();
  professorName = input<string>();
  capacity = input<DojofitClassCapacity>();
  cancelled = input(false);
  padding = input<'sm' | 'md'>('md');
}
