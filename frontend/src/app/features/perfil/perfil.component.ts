import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { iniciaisDoNome } from '../../core/utils/nome.util';
import { DojofitAvatarComponent } from '../../shared/components/base/dojofit-avatar.component';
import { DojofitCardComponent } from '../../shared/components/base/dojofit-card.component';
import { DojofitBadgeComponent } from '../../shared/components/base/dojofit-badge.component';
import { DojofitBeltBadgeComponent } from '../../shared/components/composed/dojofit-belt-badge.component';
import { MeuContratoComponent } from './meu-contrato.component';
import { HistoricoCheckinComponent } from './historico-checkin.component';
import { CheckInService } from '../checkin/checkin.service';
import { ProgressaoApiService } from '../../core/services/progressao-api.service';
import { Progressao } from '../../core/models/progressao.model';
import { TecnicaApiService } from '../../core/services/tecnica-api.service';
import { TecnicaAluno } from '../../core/models/tecnica.model';
import { CampeonatoApiService } from '../../core/services/campeonato-api.service';
import { Campeonato, RESULTADO_INFO } from '../../core/models/campeonato.model';
import { AvaliacaoApiService } from '../../core/services/avaliacao-api.service';
import { Avaliacao, TIPO_AVALIACAO_LABEL } from '../../core/models/avaliacao.model';

/**
 * Perfil (docs/02): dados pessoais para todos os papéis. Para o Aluno,
 * soma histórico de check-in e contrato — "meu contrato" entra aqui como
 * seção de dados pessoais (decisão desta sessão; docs/02 não detalhava
 * onde essa informação deveria viver).
 */
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [DojofitAvatarComponent, DojofitCardComponent, DojofitBadgeComponent, DojofitBeltBadgeComponent, MeuContratoComponent, HistoricoCheckinComponent],
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
                <dojofit-belt-badge [beltColor]="p.cor" [degree]="p.grau" [modality]="p.modalidadeNome" [showLabel]="true" size="sm" />
              }
            </div>
          } @else {
            <p class="text-body text-secondary">Sua jornada começa aqui. Sua primeira graduação aparecerá neste espaço.</p>
          }
        </dojofit-card>

        <dojofit-card>
          <h3 class="mb-3 text-label text-primary">Minhas técnicas</h3>
          @if (tecnicas().length === 0) {
            <p class="text-body text-secondary">Suas técnicas aparecerão aqui conforme seu professor registrar sua evolução.</p>
          } @else {
            @if (dominadas().length > 0) {
              <p class="mb-1 text-caption text-secondary">Dominadas</p>
              <div class="mb-3 flex flex-wrap gap-2">
                @for (t of dominadas(); track t.tecnicaId) {
                  <dojofit-badge tone="info">{{ t.tecnicaNome }}</dojofit-badge>
                }
              </div>
            }
            @if (emDesenvolvimento().length > 0) {
              <p class="mb-1 text-caption text-secondary">Em desenvolvimento</p>
              <div class="flex flex-wrap gap-2">
                @for (t of emDesenvolvimento(); track t.tecnicaId) {
                  <dojofit-badge>{{ t.tecnicaNome }}</dojofit-badge>
                }
              </div>
            }
          }
        </dojofit-card>

        <dojofit-card>
          <h3 class="mb-3 text-label text-primary">Campeonatos e medalhas</h3>
          @if (campeonatos().length === 0) {
            <p class="text-body text-secondary">Suas conquistas em campeonatos aparecerão aqui.</p>
          } @else {
            <div class="space-y-2">
              @for (c of campeonatos(); track c.id) {
                <div>
                  <p class="text-body text-primary">
                    <span aria-hidden="true">{{ resultadoInfo[c.resultado].emoji }}</span> {{ c.nome }}
                  </p>
                  <p class="text-caption text-secondary">
                    {{ resultadoInfo[c.resultado].label }} · {{ formatarData(c.data) }}@if (c.categoria) { · {{ c.categoria }}}
                  </p>
                </div>
              }
            </div>
          }
        </dojofit-card>

        <dojofit-card>
          <h3 class="mb-3 text-label text-primary">Do meu professor</h3>
          @if (avaliacoes().length === 0) {
            <p class="text-body text-secondary">Recomendações e avaliações compartilhadas pelo seu professor aparecerão aqui.</p>
          } @else {
            <div class="space-y-3">
              @for (a of avaliacoes(); track a.id) {
                <div class="border-b border-default pb-2 last:border-0">
                  <dojofit-badge tone="info">{{ tipoAvaliacaoLabel[a.tipo] }}</dojofit-badge>
                  <p class="mt-1 whitespace-pre-line text-body text-primary">{{ a.conteudo }}</p>
                  <p class="text-caption text-secondary">{{ a.autorNome }}</p>
                </div>
              }
            </div>
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
  private tecnicaApi = inject(TecnicaApiService);
  private campeonatoApi = inject(CampeonatoApiService);
  private avaliacaoApi = inject(AvaliacaoApiService);

  protected readonly resultadoInfo = RESULTADO_INFO;
  protected readonly tipoAvaliacaoLabel = TIPO_AVALIACAO_LABEL;

  protected readonly initials = computed(() => iniciaisDoNome(this.authService.user()?.nome));
  protected readonly progressao = signal<Progressao[]>([]);
  protected readonly tecnicas = signal<TecnicaAluno[]>([]);
  protected readonly campeonatos = signal<Campeonato[]>([]);
  protected readonly avaliacoes = signal<Avaliacao[]>([]);

  protected readonly dominadas = computed(() => this.tecnicas().filter(t => t.status === 'DOMINADA'));
  protected readonly emDesenvolvimento = computed(() => this.tecnicas().filter(t => t.status === 'EM_DESENVOLVIMENTO'));

  protected formatarData(iso: string): string {
    return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  ngOnInit() {
    // Meu Contrato e Histórico consomem weekInfo/historico do CheckInService
    if (this.authService.role() === 'ALUNO') {
      this.checkinService.carregarResumo();
      this.progressaoApi.minhaProgressao().subscribe(p => this.progressao.set(p));
      this.tecnicaApi.minhas().subscribe(t => this.tecnicas.set(t));
      this.campeonatoApi.meus().subscribe(c => this.campeonatos.set(c));
      this.avaliacaoApi.minhas().subscribe(a => this.avaliacoes.set(a));
    }
  }
}
