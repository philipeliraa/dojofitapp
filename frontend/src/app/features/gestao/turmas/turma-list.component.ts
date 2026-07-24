import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { Turma, DiaSemana } from '../../../core/models/turma.model';
import { Usuario } from '../../../core/models/usuario.model';
import { DojofitButtonComponent } from '../../../shared/components/base/dojofit-button.component';
import { DojofitInputComponent } from '../../../shared/components/base/dojofit-input.component';
import { DojofitFormGroupComponent } from '../components/dojofit-form-group.component';
import { DojofitDataTableComponent, DojofitColumnDef } from '../components/dojofit-data-table.component';

@Component({
  selector: 'app-turma-list',
  standalone: true,
  imports: [FormsModule, DojofitButtonComponent, DojofitInputComponent, DojofitFormGroupComponent, DojofitDataTableComponent],
  template: `
    <div>
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-title text-primary">Turmas</h2>
        <dojofit-button (onClick)="showForm.set(!showForm())">
          {{ showForm() ? 'Cancelar' : 'Nova Turma' }}
        </dojofit-button>
      </div>

      @if (showForm()) {
        <div class="mb-6">
          <dojofit-form-group>
            <form (ngSubmit)="save()" class="col-span-full grid grid-cols-1 gap-3 sm:grid-cols-2">
              <dojofit-input label="Nome" [(value)]="form.nome" />
              <div>
                <label class="mb-1 block text-label text-primary">Dia da Semana</label>
                <select [(ngModel)]="form.diaSemana" name="diaSemana" required
                  class="w-full rounded-button border border-default bg-surface-base px-3 py-2 text-body text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
                  @for (dia of dias; track dia) {
                    <option [value]="dia">{{ diaLabel(dia) }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="mb-1 block text-label text-primary">Hora Inicio</label>
                <input type="time" [(ngModel)]="form.horaInicio" name="horaInicio" required
                  class="w-full rounded-button border border-default bg-surface-base px-3 py-2 text-body text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-blue" />
              </div>
              <div>
                <label class="mb-1 block text-label text-primary">Hora Fim</label>
                <input type="time" [(ngModel)]="form.horaFim" name="horaFim" required
                  class="w-full rounded-button border border-default bg-surface-base px-3 py-2 text-body text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-blue" />
              </div>
              <dojofit-input label="Capacidade Maxima" type="number" [(value)]="form.capacidadeMaximaStr" />
              <div>
                <label class="mb-1 block text-label text-primary">Professor</label>
                <select [(ngModel)]="form.professorId" name="professorId" required
                  class="w-full rounded-button border border-default bg-surface-base px-3 py-2 text-body text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
                  <option [value]="null" disabled>Selecione um professor</option>
                  @for (prof of professores(); track prof.id) {
                    <option [ngValue]="prof.id">{{ prof.nome }}</option>
                  }
                </select>
              </div>
              <div class="sm:col-span-2">
                @if (errorMessage()) {
                  <div class="mb-2 rounded-button bg-brand-alert-soft px-3 py-2 text-body text-brand-alert-deep">{{ errorMessage() }}</div>
                }
                <dojofit-button (onClick)="save()">{{ editingId ? 'Atualizar' : 'Criar' }}</dojofit-button>
              </div>
            </form>
          </dojofit-form-group>
        </div>
      }

      <dojofit-data-table [columns]="columns" [rows]="turmas()" emptyStateMessage="Nenhuma turma cadastrada.">
        <ng-template #rowActions let-turma>
          <button (click)="edit(turma)" class="text-caption text-brand-blue hover:underline">Editar</button>
          <button (click)="toggleAtivo(turma)" class="ml-2 text-caption text-secondary hover:underline">
            {{ turma.ativo ? 'Desativar' : 'Ativar' }}
          </button>
          <button (click)="delete(turma)" class="ml-2 text-caption text-brand-alert hover:underline">Excluir</button>
        </ng-template>
      </dojofit-data-table>
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
  form = { nome: '', diaSemana: 'MON' as DiaSemana, horaInicio: '', horaFim: '', capacidadeMaximaStr: '20', professorId: null as number | null };

  columns: DojofitColumnDef<Turma>[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'diaSemana', label: 'Dia', render: (t) => this.diaLabel(t.diaSemana) },
    { key: 'horario', label: 'Horario', render: (t) => `${t.horaInicio} - ${t.horaFim}` },
    { key: 'capacidadeMaxima', label: 'Capacidade' },
    { key: 'professorNome', label: 'Professor' },
  ];

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

    if (this.form.horaFim <= this.form.horaInicio) {
      this.errorMessage.set('Hora fim deve ser depois da hora inicio. Turmas nao podem atravessar a meia-noite.');
      return;
    }

    const body = { ...this.form, capacidadeMaxima: Number(this.form.capacidadeMaximaStr) };
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
      capacidadeMaximaStr: String(turma.capacidadeMaxima),
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
    this.form = { nome: '', diaSemana: 'MON', horaInicio: '', horaFim: '', capacidadeMaximaStr: '20', professorId: null };
    this.showForm.set(false);
  }

  diaLabel(dia: DiaSemana | string): string {
    const labels: Record<string, string> = { MON: 'Segunda', TUE: 'Terca', WED: 'Quarta', THU: 'Quinta', FRI: 'Sexta', SAT: 'Sabado', SUN: 'Domingo' };
    return labels[dia] ?? dia;
  }
}
