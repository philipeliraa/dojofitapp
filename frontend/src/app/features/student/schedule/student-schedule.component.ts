import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Aula } from '../../../core/models/aula.model';

@Component({
  selector: 'app-student-schedule',
  standalone: true,
  template: `
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Grade Semanal</h2>

      <div class="flex items-center justify-between mb-4">
        <button (click)="prevWeek()" class="text-blue-600 text-sm hover:underline">← Anterior</button>
        <span class="text-sm font-medium text-gray-700">{{ weekLabel }}</span>
        <button (click)="nextWeek()" class="text-blue-600 text-sm hover:underline">Proxima →</button>
      </div>

      @for (day of weekDays; track day.date) {
        <div class="mb-4">
          <h3 class="text-sm font-medium text-gray-500 mb-2">{{ day.label }}</h3>
          @if (getAulasForDate(day.date).length === 0) {
            <p class="text-xs text-gray-400 ml-2">Sem aulas</p>
          } @else {
            <div class="space-y-2">
              @for (aula of getAulasForDate(day.date); track aula.id) {
                <div class="bg-white rounded-lg shadow-sm p-3 flex items-center justify-between"
                     [class.opacity-50]="aula.cancelada">
                  <div>
                    <p class="font-medium text-gray-900 text-sm">{{ aula.turmaNome ?? 'Avulsa' }}</p>
                    <p class="text-xs text-gray-500">{{ aula.horaInicio }} - {{ aula.horaFim }} | Prof. {{ aula.professorNome }}</p>
                  </div>
                  <div class="text-right">
                    @if (aula.cancelada) {
                      <span class="text-red-500 text-xs">Cancelada</span>
                    } @else {
                      <span class="text-xs" [class]="aula.vagasDisponiveis > 0 ? 'text-green-600' : 'text-orange-500'">
                        {{ aula.vagasDisponiveis }} vagas
                      </span>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class StudentScheduleComponent implements OnInit {
  aulas = signal<Aula[]>([]);
  weekStart = this.getMonday(new Date());
  weekDays: { date: string; label: string }[] = [];
  weekLabel = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.updateWeek();
  }

  prevWeek() {
    this.weekStart.setDate(this.weekStart.getDate() - 7);
    this.updateWeek();
  }

  nextWeek() {
    this.weekStart.setDate(this.weekStart.getDate() + 7);
    this.updateWeek();
  }

  updateWeek() {
    const start = this.formatDate(this.weekStart);
    const dayNames = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado', 'Domingo'];
    this.weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.weekStart);
      d.setDate(d.getDate() + i);
      return { date: this.formatDate(d), label: `${dayNames[i]} ${d.getDate()}/${d.getMonth() + 1}` };
    });
    this.weekLabel = `${this.weekDays[0].date} a ${this.weekDays[6].date}`;

    this.http.get<Aula[]>(`${environment.apiUrl}/aulas/semana?inicio=${start}`)
      .subscribe(data => this.aulas.set(data));
  }

  getAulasForDate(date: string): Aula[] {
    return this.aulas().filter(a => a.data === date);
  }

  private getMonday(d: Date): Date {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
