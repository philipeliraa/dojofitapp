import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { iniciaisDoNome } from '../../core/utils/nome.util';
import { DojofitAvatarComponent } from '../../shared/components/base/dojofit-avatar.component';
import { DojofitCardComponent } from '../../shared/components/base/dojofit-card.component';
import { DojofitBeltBadgeComponent } from '../../shared/components/composed/dojofit-belt-badge.component';
import { MeuContratoComponent } from './meu-contrato.component';
import { HistoricoCheckinComponent } from './historico-checkin.component';
import { CheckInService } from '../checkin/checkin.service';
import { ProgressaoApiService } from '../../core/services/progressao-api.service';
import { Progressao } from '../../core/models/progressao.model';

/**
 * Perfil (docs/02): dados pessoais para todos os papéis. Para o Aluno,
 * soma histórico de check-in e contrato — "meu contrato" entra aqui como
 * seção de dados pessoais (decisão desta sessão; docs/02 não detalhava
 * onde essa informação deveria viver).
 */
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [DojofitAvatarComponent, DojofitCardComponent, DojofitBeltBadgeComponent, MeuContratoComponent, HistoricoCheckinComponent],
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
        <dojofit-card>
          <h3 class="mb-3 text-label text-primary">Minha progressão</h3>
          @if (progressao().length > 0) {
            <div class="flex flex-wrap gap-2">
              @for (p of progressao(); track p.modalidadeId) {
                <dojofit-belt-badge [beltColor]="p.cor" [degree]="p.grau" [modality]="p.modalidadeNome" />
              }
            </div>
          } @else {
            <p class="text-body text-secondary">Sua jornada começa aqui. Sua primeira graduação aparecerá neste espaço.</p>
          }
        </dojofit-card>

        <app-meu-contrato />
        <app-historico-checkin />
      }
    </div>
  `,
})
export class PerfilComponent implements OnInit {
  protected authService = inject(AuthService);
  private checkinService = inject(CheckInService);
  private progressaoApi = inject(ProgressaoApiService);

  protected readonly initials = computed(() => iniciaisDoNome(this.authService.user()?.nome));
  protected readonly progressao = signal<Progressao[]>([]);

  ngOnInit() {
    // Meu Contrato e Histórico consomem weekInfo/historico do CheckInService
    if (this.authService.role() === 'ALUNO') {
      this.checkinService.carregarResumo();
      this.progressaoApi.minhaProgressao().subscribe(p => this.progressao.set(p));
    }
  }
}
