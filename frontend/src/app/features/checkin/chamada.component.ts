import { Component, OnInit, signal } from '@angular/core';
import { AulaApiService } from '../../core/services/aula-api.service';
import { Aula } from '../../core/models/aula.model';
import { CheckInService } from './checkin.service';
import { formatDateLocal } from '../../core/utils/data.util';
import { DojofitCardComponent } from '../../shared/components/base/dojofit-card.component';
import { DojofitButtonComponent } from '../../shared/components/base/dojofit-button.component';
import { DojofitBadgeComponent } from '../../shared/components/base/dojofit-badge.component';
import { DojofitInputComponent } from '../../shared/components/base/dojofit-input.component';
import { DojofitClassCardComponent } from '../../shared/components/composed/dojofit-class-card.component';

/**
 * Início do Professor/Admin (docs/02): turmas de hoje + lista de presença.
 * Consome o CheckInService único (antes tinha sua própria cópia da lógica
 * de check-in manual, hoje compartilhada com o Calendário do professor).
 */
@Component({
  selector: 'app-chamada',
  standalone: true,
  imports: [DojofitCardComponent, DojofitButtonComponent, DojofitBadgeComponent, DojofitInputComponent, DojofitClassCardComponent],
  template: `
    <div>
      <h2 class="mb-4 text-title text-primary">Chamada</h2>

      <div class="mb-6 space-y-2">
        @for (aula of aulas(); track aula.id) {
          <button
            class="block w-full text-left"
            [class.ring-2]="selectedAula()?.id === aula.id"
            [class.ring-brand-blue]="selectedAula()?.id === aula.id"
            (click)="selectAula(aula)"
          >
            <dojofit-class-card
              padding="sm"
              [className]="aula.turmaNome ?? 'Avulsa'"
              [time]="aula.horaInicio + ' - ' + aula.horaFim"
              [capacity]="{ current: aula.checkinsConfirmados, max: aula.capacidadeMaxima }"
            />
          </button>
        }
        @if (aulas().length === 0) {
          <p class="py-4 text-center text-body text-secondary">Nenhuma aula hoje</p>
        }
      </div>

      @if (selectedAula()) {
        <dojofit-card>
          <h3 class="mb-3 text-heading text-primary">{{ selectedAula()!.turmaNome }} - Presenca</h3>

          <div class="mb-4 flex items-end gap-2">
            <dojofit-input label="ID do aluno" type="number" [(value)]="manualAlunoId" />
            <dojofit-button size="sm" (onClick)="manualCheckin()">Check-in Manual</dojofit-button>
          </div>

          <div class="space-y-2">
            @for (checkin of checkinService.checkinsDaAula(); track checkin.id) {
              <div class="flex items-center justify-between border-b border-default py-2 last:border-0">
                <div>
                  <p class="text-body font-medium text-primary">{{ checkin.alunoNome }}</p>
                  <p class="text-caption text-secondary">{{ checkin.tipo === 'PROFESSOR' ? 'Manual' : 'Proprio' }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <dojofit-badge [tone]="statusTone(checkin.status)">{{ statusLabel(checkin.status) }}</dojofit-badge>
                  @if (checkin.status === 'LISTA_ESPERA') {
                    <button (click)="liberarExcecao(checkin.id)" class="text-caption text-brand-blue hover:underline">Liberar</button>
                  }
                </div>
              </div>
            }
            @if (checkinService.checkinsDaAula().length === 0) {
              <p class="py-2 text-center text-body text-secondary">Nenhum check-in</p>
            }
          </div>
        </dojofit-card>

        @if (message()) {
          <div class="mt-3 rounded-button p-3 text-center text-body font-medium"
               [class]="messageType() === 'success' ? 'bg-state-success-soft text-state-success-deep' : 'bg-brand-alert-soft text-brand-alert-deep'">
            {{ message() }}
          </div>
        }
      }
    </div>
  `,
})
export class ChamadaComponent implements OnInit {
  aulas = signal<Aula[]>([]);
  selectedAula = signal<Aula | null>(null);
  manualAlunoId = '';
  message = signal('');
  messageType = signal<'success' | 'error'>('success');

  constructor(private aulaApi: AulaApiService, protected checkinService: CheckInService) {}

  ngOnInit() {
    const today = formatDateLocal(new Date());
    this.aulaApi.getPorData(today).subscribe(data => this.aulas.set(data));
  }

  selectAula(aula: Aula) {
    this.selectedAula.set(aula);
    this.checkinService.carregarChecacksDaAula(aula.id);
  }

  manualCheckin() {
    const aula = this.selectedAula();
    if (!this.manualAlunoId || !aula) return;
    this.checkinService.manualCheckin(aula.id, Number(this.manualAlunoId)).subscribe({
      next: () => {
        this.showMessage('Check-in manual realizado', 'success');
        this.manualAlunoId = '';
      },
      error: (err) => this.showMessage(err.error?.error ?? 'Erro', 'error'),
    });
  }

  liberarExcecao(checkinId: number) {
    const aula = this.selectedAula();
    if (!aula) return;
    this.checkinService.liberarExcecao(checkinId, aula.id).subscribe({
      next: () => this.showMessage('Excecao liberada', 'success'),
      error: (err) => this.showMessage(err.error?.error ?? 'Erro', 'error'),
    });
  }

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

  private showMessage(text: string, type: 'success' | 'error') {
    this.message.set(text);
    this.messageType.set(type);
    setTimeout(() => this.message.set(''), 3000);
  }
}
