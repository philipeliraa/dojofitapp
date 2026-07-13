import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { Aula } from '../../../core/models/aula.model';

@Component({
  selector: 'app-aula-management',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-brand-navy">Aulas</h2>
        <div class="flex gap-2">
          <button (click)="generate()" class="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-blue/90">
            Gerar Semana
          </button>
        </div>
      </div>

      <div class="mb-4 flex gap-2 items-center">
        <label class="text-sm font-medium text-gray-700">Data:</label>
        <input type="date" [(ngModel)]="selectedDate" (change)="load()"
          class="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue text-sm" />
      </div>

      <div class="space-y-3">
        @for (aula of aulas(); track aula.id) {
          <div class="bg-white rounded-xl shadow-sm p-4" [class.opacity-50]="aula.cancelada">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium text-gray-900">{{ aula.turmaNome ?? 'Aula Avulsa' }}</h3>
                <p class="text-sm text-gray-500">{{ aula.horaInicio }} - {{ aula.horaFim }} | Prof. {{ aula.professorNome }}</p>
                <p class="text-sm text-gray-500">{{ aula.checkinsConfirmados }}/{{ aula.capacidadeMaxima }} vagas</p>
              </div>
              <div class="flex gap-2">
                @if (aula.cancelada) {
                  <span class="text-red-500 text-sm font-medium">Cancelada</span>
                } @else {
                  <button (click)="cancel(aula.id)" class="text-brand-alert text-sm hover:underline">Cancelar</button>
                }
              </div>
            </div>
          </div>
        }

        @if (aulas().length === 0) {
          <p class="text-gray-500 text-center py-8">Nenhuma aula para esta data</p>
        }
      </div>
    </div>
  `,
})
export class AulaManagementComponent implements OnInit {
  aulas = signal<Aula[]>([]);
  selectedDate = new Date().toISOString().split('T')[0];

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
