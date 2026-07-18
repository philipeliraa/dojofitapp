import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { Contrato } from '../../../core/models/contrato.model';
import { Usuario } from '../../../core/models/usuario.model';
import { Plano } from '../../../core/models/plano.model';
import { DojofitButtonComponent } from '../../../shared/components/base/dojofit-button.component';
import { DojofitFormGroupComponent } from '../components/dojofit-form-group.component';
import { DojofitDataTableComponent, DojofitColumnDef } from '../components/dojofit-data-table.component';

@Component({
  selector: 'app-contrato-list',
  standalone: true,
  imports: [FormsModule, DojofitButtonComponent, DojofitFormGroupComponent, DojofitDataTableComponent],
  template: `
    <div>
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-title text-primary">Contratos</h2>
        <dojofit-button (onClick)="showForm.set(!showForm())">
          {{ showForm() ? 'Cancelar' : 'Novo Contrato' }}
        </dojofit-button>
      </div>

      @if (showForm()) {
        <div class="mb-6">
          <dojofit-form-group>
            <form (ngSubmit)="save()" class="col-span-full grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-label text-primary">Aluno</label>
                <select [(ngModel)]="form.alunoId" name="alunoId" required
                  class="w-full rounded-button border border-default bg-surface-base px-3 py-2 text-body text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
                  <option [value]="null" disabled>Selecione um aluno</option>
                  @for (aluno of alunos(); track aluno.id) {
                    <option [ngValue]="aluno.id">{{ aluno.nome }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="mb-1 block text-label text-primary">Plano</label>
                <select [(ngModel)]="form.planoId" name="planoId" required
                  class="w-full rounded-button border border-default bg-surface-base px-3 py-2 text-body text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
                  <option [value]="null" disabled>Selecione um plano</option>
                  @for (plano of planos(); track plano.id) {
                    <option [ngValue]="plano.id">{{ plano.nome }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="mb-1 block text-label text-primary">Data Inicio</label>
                <input type="date" [(ngModel)]="form.dataInicio" name="dataInicio" required
                  class="w-full rounded-button border border-default bg-surface-base px-3 py-2 text-body text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-blue" />
              </div>
              <div>
                <label class="mb-1 block text-label text-primary">Data Validade</label>
                <input type="date" [(ngModel)]="form.dataValidade" name="dataValidade" required
                  class="w-full rounded-button border border-default bg-surface-base px-3 py-2 text-body text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-blue" />
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

      <dojofit-data-table [columns]="columns" [rows]="contratos()" emptyStateMessage="Nenhum contrato cadastrado.">
        <ng-template #rowActions let-contrato>
          <button (click)="edit(contrato)" class="text-caption text-brand-blue hover:underline">Editar</button>
          <button (click)="delete(contrato)" class="ml-2 text-caption text-brand-alert hover:underline">Excluir</button>
        </ng-template>
      </dojofit-data-table>
    </div>
  `,
})
export class ContratoListComponent implements OnInit {
  contratos = signal<Contrato[]>([]);
  alunos = signal<Usuario[]>([]);
  planos = signal<Plano[]>([]);
  showForm = signal(false);
  errorMessage = signal('');
  editingId: number | null = null;
  form = { alunoId: null as number | null, planoId: null as number | null, dataInicio: '', dataValidade: '' };

  columns: DojofitColumnDef<Contrato>[] = [
    { key: 'alunoNome', label: 'Aluno' },
    { key: 'planoNome', label: 'Plano' },
    { key: 'dataInicio', label: 'Inicio' },
    { key: 'dataValidade', label: 'Validade' },
    { key: 'status', label: 'Status' },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.load();
    this.http.get<Usuario[]>(`${environment.apiUrl}/admin/usuarios?role=ALUNO`).subscribe(data => this.alunos.set(data));
    this.http.get<Plano[]>(`${environment.apiUrl}/planos`).subscribe(data => this.planos.set(data));
  }

  load() {
    this.http.get<Contrato[]>(`${environment.apiUrl}/contratos`).subscribe(data => this.contratos.set(data));
  }

  save() {
    this.errorMessage.set('');

    if (!this.form.alunoId || !this.form.planoId || !this.form.dataInicio || !this.form.dataValidade) {
      this.errorMessage.set('Preencha todos os campos obrigatorios.');
      return;
    }

    const body = { ...this.form };
    const req = this.editingId
      ? this.http.put(`${environment.apiUrl}/contratos/${this.editingId}`, body)
      : this.http.post(`${environment.apiUrl}/contratos`, body);

    req.subscribe({
      next: () => {
        this.resetForm();
        this.load();
      },
      error: (err) => {
        const msg = err.error?.message || err.error?.error || 'Erro ao salvar contrato. Tente novamente.';
        this.errorMessage.set(msg);
      }
    });
  }

  edit(contrato: Contrato) {
    this.editingId = contrato.id;
    this.form = { alunoId: contrato.alunoId, planoId: contrato.planoId, dataInicio: contrato.dataInicio, dataValidade: contrato.dataValidade };
    this.showForm.set(true);
  }

  delete(contrato: Contrato) {
    if (!confirm(`Excluir o contrato de "${contrato.alunoNome}"?`)) return;
    this.http.delete(`${environment.apiUrl}/contratos/${contrato.id}`).subscribe({
      next: () => this.load(),
      error: (err) => alert(err.error?.message || 'Erro ao excluir contrato.')
    });
  }

  resetForm() {
    this.editingId = null;
    this.form = { alunoId: null, planoId: null, dataInicio: '', dataValidade: '' };
    this.showForm.set(false);
  }
}
