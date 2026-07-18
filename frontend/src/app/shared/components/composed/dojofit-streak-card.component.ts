import { Component, input } from '@angular/core';
import { DojofitCardComponent } from '../base/dojofit-card.component';

/**
 * Camada 2 (docs/04 seção 3): streak semanal do aluno — semanas
 * consecutivas com pelo menos 1 treino (docs/01, não dias). Composto de
 * dojofit-card + text.title para o número + text.caption para a mensagem.
 */
@Component({
  selector: 'dojofit-streak-card',
  standalone: true,
  imports: [DojofitCardComponent],
  template: `
    <dojofit-card>
      <div class="mb-1 flex items-baseline justify-between">
        <span class="text-title text-primary">
          {{ weeklyStreak() }} {{ weeklyStreak() === 1 ? 'semana' : 'semanas' }}
        </span>
        @if (averageSessionsPerWeek(); as media) {
          <span class="text-caption text-secondary">média {{ media }}/semana</span>
        }
      </div>
      <p class="text-caption text-secondary">{{ contextualMessage() }}</p>
    </dojofit-card>
  `,
})
export class DojofitStreakCardComponent {
  weeklyStreak = input.required<number>();
  averageSessionsPerWeek = input<number>();
  contextualMessage = input.required<string>();
}
