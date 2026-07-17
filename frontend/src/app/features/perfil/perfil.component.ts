import { Component, computed } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { iniciaisDoNome } from '../../core/utils/nome.util';
import { DojofitAvatarComponent } from '../../shared/components/base/dojofit-avatar.component';
import { DojofitCardComponent } from '../../shared/components/base/dojofit-card.component';
import { MyContractComponent } from '../student/contract/my-contract.component';
import { CheckinHistoryComponent } from '../student/history/checkin-history.component';

/**
 * Perfil (docs/02): dados pessoais para todos os papéis. Para o Aluno,
 * soma histórico de check-in e contrato — "meu contrato" entra aqui como
 * seção de dados pessoais (decisão desta sessão; docs/02 não detalhava
 * onde essa informação deveria viver).
 */
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [DojofitAvatarComponent, DojofitCardComponent, MyContractComponent, CheckinHistoryComponent],
  template: `
    <div class="space-y-4">
      <dojofit-card>
        <div class="flex items-center gap-3">
          @if (initials(); as i) {
            <dojofit-avatar [initials]="i" />
          }
          <div>
            <h2 class="text-title text-primary">{{ authService.user()?.nome }}</h2>
            <p class="text-body text-secondary">{{ authService.user()?.email }}</p>
          </div>
        </div>
      </dojofit-card>

      @if (authService.role() === 'ALUNO') {
        <app-my-contract />
        <app-checkin-history />
      }
    </div>
  `,
})
export class PerfilComponent {
  constructor(public authService: AuthService) {}

  protected readonly initials = computed(() => iniciaisDoNome(this.authService.user()?.nome));
}
