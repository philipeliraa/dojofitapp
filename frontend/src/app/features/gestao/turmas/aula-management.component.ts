import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { Aula } from '../../../core/models/aula.model';
import { formatDateLocal } from '../../../core/utils/data.util';
import { DojofitButtonComponent } from '../../../shared/components/base/dojofit-button.component';
import { DojofitClassCardComponent } from '../../../shared/components/composed/dojofit-class-card.component';

@Component({
  selector: 'app-aula-management',
  standalone: true,
  imports: [FormsModule, DojofitButtonComponent, DojofitClassCardComponent],
  template: `
    <div>
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-title text-primary">Aulas</h2>
        <dojofit-button (onClick)="generate()">Gerar Semana</dojofit-button>
      </div>

      <div class="mb-4 flex items-center gap-2">
        <label class="text-label text-primary">Data:</label>
        <input type="date" [(ngModel)]="selectedDate" (change)="load()"
          class="rounded-button border border-default bg-surface-base px-3 py-2 text-body text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-blue" />
      </div>

      <div class="space-y-3">
        @for (aula of aulas(); track aula.id) {
          <dojofit-class-card
            [className]="aula.turmaNome ?? 'Aula Avulsa'"
            [time]="aula.horaInicio + ' - ' + aula.horaFim"
            [professorName]="aula.professorNome"
            [capacity]="{ current: aula.checkinsConfirmados, max: aula.capacidadeMaxima }"
            [cancelled]="aula.cancelada"
          >
            @if (!aula.cancelada) {
              <button (click)="cancel(aula.id)" class="text-body text-brand-alert hover:underline">Cancelar</button>
            }
          </dojofit-class-card>
        }

        @if (aulas().length === 0) {
          <p class="py-8 text-center text-body text-secondary">Nenhuma aula para esta data</p>
        }
      </div>
    </div>
  `,
})
export class AulaManagementComponent implements OnInit {
  aulas = signal<Aula[]>([]);
  selectedDate = formatDateLocal(new Date());

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.http.get<Aula[]>(`${environment.apiUrl}/aulas?data=${this.selectedDate}`).subscribe(data => this.aulas.set(data));
  }

  generate() {
    this.http.post(`${environment.apiUrl}/aulas/generate`, {}).subscribe(() => this.load());
  }

  cancel(id: number) {
    this.http.patch(`${environment.apiUrl}/aulas/${id}/cancel`, {}).subscribe(() => this.load());
  }
}
