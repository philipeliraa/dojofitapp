import { Component, inject } from '@angular/core';
import { CheckInService } from '../checkin/checkin.service';
import { DojofitCardComponent } from '../../shared/components/base/dojofit-card.component';
import { DojofitBadgeComponent } from '../../shared/components/base/dojofit-badge.component';

/**
 * Histórico de check-in — seção de Perfil (docs/02, Fase 1a). Usa o
 * historico já carregado pelo CheckInService em vez de refazer a chamada.
 */
@Component({
  selector: 'app-historico-checkin',
  standalone: true,
  imports: [DojofitCardComponent, DojofitBadgeComponent],
  template: `
    <dojofit-card>
      <h2 class="mb-4 text-heading text-primary">Historico de Check-ins</h2>

      @if (checkinService.historico().length === 0) {
        <div class="py-8 text-center text-body text-secondary">Nenhum check-in registrado</div>
      } @else {
        <div class="space-y-2">
          @for (checkin of checkinService.historico(); track checkin.id) {
            <div class="border-b border-default pb-2 last:border-0">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-body font-medium text-primary">{{ checkin.turmaNome }}</p>
                  <p class="text-caption text-secondary">{{ checkin.aulaData }} | {{ checkin.aulaHoraInicio }}</p>
                </div>
                <div class="text-right">
                  <dojofit-badge [tone]="statusTone(checkin.status)">{{ statusLabel(checkin.status) }}</dojofit-badge>
                  <p class="mt-1 text-caption text-secondary">{{ checkin.tipo === 'PROFESSOR' ? 'Manual' : 'Proprio' }}</p>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </dojofit-card>
  `,
})
export class HistoricoCheckinComponent {
  protected checkinService = inject(CheckInService);

  statusTone(status: string): 'neutral' | 'info' | 'alert' {
    switch (status) {
      case 'CONFIRMADO': return 'info';
      case 'LISTA_ESPERA': return 'alert';
      default: return 'neutral';
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'CONFIRMADO': return 'Confirmado';
      case 'EXCECAO_LIBERADA': return 'Excecao';
      case 'LISTA_ESPERA': return 'Lista Espera';
      default: return status;
    }
  }
}
