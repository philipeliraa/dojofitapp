import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { Turma, DiaSemana } from '../../../core/models/turma.model';
import { Usuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-turma-list',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-brand-navy">Turmas</h2>
        <button (click)="showForm.set(!showForm())" class="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-blue/90">
          {{ showForm() ? 'Cancelar' : 'Nova Turma' }}
        </button>
      </div>

      @if (showForm()) {
        <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
          <form (ngSubmit)="save()" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input type="text" [(ngModel)]="form.nome" name="nome" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Dia da Semana</label>
              <select [(ngModel)]="form.diaSemana" name="diaSemana" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue">
                @for (dia of dias; track dia) {
                  <option [value]="dia">{{ diaLabel(dia) }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
              <input type="time" [(ngModel)]="form.horaInicio" name="horaInicio" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Hora Fim</label>
              <input type="time" [(ngModel)]="form.horaFim" name="horaFim" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Capacidade Maxima</label>
              <input type="number" [(ngModel)]="form.capacidadeMaxima" name="capacidadeMaxima" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Professor</label>
              <select [(ngModel)]="form.professorId" name="professorId" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue">
                <option [value]="null" disabled>Selecione um professor</option>
                @for (prof of professores(); track prof.id) {
                  <option [ngValue]="prof.id">{{ prof.nome }}</option>
                }
              </select>
            </div>
            <div class="sm:col-span-2">
              @if (errorMessage()) {
                <div class="mb-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{{ errorMessage() }}</div>
              }
              <button type="submit" class="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-blue/90">
                {{ editingId ? 'Atualizar' : 'Criar' }}
              </button>
            </div>
          </form>
        </div>
      }

      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-4 py-3 font-medium text-gray-700">Nome</th>
              <th class="text-left px-4 py-3 font-medium text-gray-700">Dia</th>
              <th class="text-left px-4 py-3 font-medium text-gray-700">Horario</th>
              <th class="text-left px-4 py-3 font-medium text-gray-700">Capacidade</th>
              <th class="text-left px-4 py-3 font-medium text-gray-700">Professor</th>
              <th class="text-right px-4 py-3 font-medium text-gray-700">Acoes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            @for (turma of turmas(); track turma.id) {
              <tr>
                <td class="px-4 py-3">{{ turma.nome }}</td>
                <td class="px-4 py-3">{{ diaLabel(turma.diaSemana) }}</td>
                <td class="px-4 py-3">{{ turma.horaInicio }} - {{ turma.horaFim }}</td>
                <td class="px-4 py-3">{{ turma.capacidadeMaxima }}</td>
                <td class="px-4 py-3">{{ turma.professorNome }}</td>
                <td class="px-4 py-3 text-right space-x-2">
                  <button (click)="edit(turma)" class="text-brand-blue hover:underline">Editar</button>
                  <button (click)="toggleAtivo(turma)" class="text-gray-500 hover:underline">
                    {{ turma.ativo ? 'Desativar' : 'Ativar' }}
                  </button>
                  <button (click)="delete(turma)" class="text-brand-alert hover:underline">Excluir</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class TurmaListComponent implements OnInit {
  turmas = signal<Turma[]>([]);
  professores = signal<Usuario[]>([]);
  showForm = signal(false);
  errorMessage = signal('');
  editingId: number | null = null;
  dias: DiaSemana[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  form = { nome: '', diaSemana: 'MON' as DiaSemana, horaInicio: '', horaFim: '', capacidadeMaxima: 20, professorId: null as number | null };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.load();
    this.http.get<Usuario[]>(`${environment.apiUrl}/admin/usuarios?role=PROFESSOR`).subscribe(data => this.professores.set(data));
  }

  load() {
    this.http.get<Turma[]>(`${environment.apiUrl}/turmas`).subscribe(data => this.turmas.set(data));
  }

  save() {
    this.errorMessage.set('');

    if (!this.form.nome || !this.form.horaInicio || !this.form.horaFim || !this.form.professorId) {
      this.errorMessage.set('Preencha todos os campos obrigatorios.');
      return;
    }

    const body = { ...this.form };
    const req = this.editingId
      ? this.http.put(`${environment.apiUrl}/turmas/${this.editingId}`, body)
      : this.http.post(`${environment.apiUrl}/turmas`, body);

    req.subscribe({
      next: () => {
        this.resetForm();
        this.load();
      },
      error: (err) => {
        const msg = err.error?.message || err.error?.error || 'Erro ao salvar turma. Tente novamente.';
        this.errorMessage.set(msg);
      }
    });
  }

  edit(turma: Turma) {
    this.editingId = turma.id;
    this.form = {
      nome: turma.nome,
      diaSemana: turma.diaSemana,
      horaInicio: turma.horaInicio,
      horaFim: turma.horaFim,
      capacidadeMaxima: turma.capacidadeMaxima,
      professorId: turma.professorId,
    };
    this.showForm.set(true);
  }

  toggleAtivo(turma: Turma) {
    this.http.patch(`${environment.apiUrl}/turmas/${turma.id}/toggle`, {}).subscribe(() => this.load());
  }

  delete(turma: Turma) {
    if (!confirm(`Excluir a turma "${turma.nome}"?`)) return;
    this.http.delete(`${environment.apiUrl}/turmas/${turma.id}`).subscribe({
      next: () => this.load(),
      error: (err) => alert(err.error?.message || 'Erro ao excluir turma.')
    });
  }

  resetForm() {
    this.editingId = null;
    this.form = { nome: '', diaSemana: 'MON', horaInicio: '', horaFim: '', capacidadeMaxima: 20, professorId: null };
    this.showForm.set(false);
  }

  diaLabel(dia: DiaSemana | string): string {
    const labels: Record<string, string> = { MON: 'Segunda', TUE: 'Terca', WED: 'Quarta', THU: 'Quinta', FRI: 'Sexta', SAT: 'Sabado', SUN: 'Domingo' };
    return labels[dia] ?? dia;
  }
}
