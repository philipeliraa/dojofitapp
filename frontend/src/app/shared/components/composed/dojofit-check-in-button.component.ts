import { Component, input, output } from '@angular/core';
import { DojofitButtonComponent } from '../base/dojofit-button.component';

export type DojofitCheckInState = 'available' | 'checked-in' | 'blocked' | 'waitlisted';

/**
 * Camada 2 (docs/04 seção 3): especialização de dojofit-button para a
 * ação de check-in — encapsula os 4 estados documentados, incluindo o
 * alerta de limite semanal atingido (brand.alert quando blocked).
 *
 * Estados que NÃO são resultado de um check-in em si (aula cancelada,
 * pendente de sincronização offline) ficam fora deste componente — são
 * decididos pela tela antes de renderizar dojofit-check-in-button.
 */
@Component({
  selector: 'dojofit-check-in-button',
  standalone: true,
  imports: [DojofitButtonComponent],
  template: `
    @switch (state()) {
      @case ('available') {
        <dojofit-button [fullWidth]="fullWidth()" [size]="size()" [loading]="loading()" (onClick)="action.emit()">
          Fazer Check-in
        </dojofit-button>
      }
      @case ('checked-in') {
        <div class="flex items-center justify-between rounded-button border border-default bg-state-success-soft p-2">
          <span class="text-body font-medium text-state-success-deep">Check-in realizado!</span>
          <dojofit-button variant="alert" size="sm" (onClick)="action.emit()">Desfazer</dojofit-button>
        </div>
      }
      @case ('blocked') {
        <div class="rounded-button border border-default bg-brand-alert-soft p-2 text-center">
          <span class="text-body font-medium text-brand-alert-deep">Limite semanal atingido</span>
        </div>
      }
      @case ('waitlisted') {
        <div class="rounded-button border border-default bg-accent-blue-soft p-2 text-center">
          <span class="text-body font-medium text-accent-blue-deep">Você está na lista de espera</span>
        </div>
      }
    }
  `,
})
export class DojofitCheckInButtonComponent {
  state = input.required<DojofitCheckInState>();
  loading = input(false);
  fullWidth = input(false);
  size = input<'sm' | 'md'>('md');

  /** Emitido no clique — "fazer check-in" em available, "desfazer" em checked-in. */
  action = output<void>();
}
