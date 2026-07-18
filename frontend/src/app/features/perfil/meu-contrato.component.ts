import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Contrato } from '../../core/models/contrato.model';
import { CheckInService } from '../checkin/checkin.service';
import { DojofitCardComponent } from '../../shared/components/base/dojofit-card.component';
import { DojofitBadgeComponent } from '../../shared/components/base/dojofit-badge.component';

/**
 * Meu Contrato — seção de Perfil (docs/02, decisão desta sessão: contrato
 * entra como dado pessoal, não em tela própria). Usa o weekInfo já
 * carregado pelo CheckInService em vez de refazer a mesma chamada.
 */
@Component({
  selector: 'app-meu-contrato',
  standalone: true,
  imports: [DojofitCardComponent, DojofitBadgeComponent],
  template: `
    <dojofit-card>
      <h2 class="mb-4 text-heading text-primary">Meu Contrato</h2>

      @if (loading()) {
        <div class="py-8 text-center text-body text-secondary">Carregando...</div>
      } @else if (contratos().length === 0) {
        <div class="py-8 text-center text-body text-secondary">Nenhum contrato encontrado. Procure o administrador.</div>
      } @else {
        <div class="space-y-4">
          @for (contrato of contratos(); track contrato.id) {
            <div>
              <div class="mb-3 flex items-center justify-between">
                <h3 class="text-body font-semibold text-primary">{{ contrato.planoNome }}</h3>
                <dojofit-badge [tone]="contrato.status === 'ATIVO' ? 'info' : 'alert'">{{ contrato.status }}</dojofit-badge>
              </div>

              <div class="space-y-2 text-body">
                <div class="flex justify-between">
                  <span class="text-secondary">Inicio</span>
                  <span class="text-primary">{{ contrato.dataInicio }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-secondary">Validade</span>
                  <span class="text-primary">{{ contrato.dataValidade }}</span>
                </div>
              </div>

              @if (checkinService.weekInfo(); as w) {
                <div class="mt-4 border-t border-default pt-3">
                  <div class="mb-1 flex justify-between text-body">
                    <span class="text-secondary">Check-ins esta semana</span>
                    <span class="font-medium text-primary">{{ w.count }}</span>
                  </div>
                  <div class="h-2 w-full rounded-full bg-surface-body">
                    <div class="h-2 rounded-full bg-brand-blue transition-all" [style.width.%]="progressPercent()"></div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </dojofit-card>
  `,
})
export class MeuContratoComponent implements OnInit {
  protected checkinService = inject(CheckInService);
  private http = inject(HttpClient);

  contratos = signal<Contrato[]>([]);
  loading = signal(true);

  protected readonly progressPercent = computed(() => {
    const count = this.checkinService.weekInfo()?.count ?? 0;
    const ativo = this.contratos().find(c => c.status === 'ATIVO');
    if (!ativo) return 0;
    return Math.min(count * 20, 100);
  });

  ngOnInit() {
    this.http.get<Contrato[]>(`${environment.apiUrl}/contratos/meu`).subscribe({
      next: data => { this.contratos.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
