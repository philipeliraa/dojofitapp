import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { Contrato } from '../../../core/models/contrato.model';
import { Usuario } from '../../../core/models/usuario.model';
import { Plano } from '../../../core/models/plano.model';

@Component({
  selector: 'app-contrato-list',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-brand-navy">Contratos</h2>
        <button (click)="showForm.set(!showForm())" class="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-blue/90">
          {{ showForm() ? 'Cancelar' : 'Novo Contrato' }}
        </button>
      </div>

      @if (showForm()) {
        <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
          <form (ngSubmit)="save()" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Aluno</label>
              <select [(ngModel)]="form.alunoId" name="alunoId" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue">
                <option [value]="null" disabled>Selecione um aluno</option>
                @for (aluno of alunos(); track aluno.id) {
                  <option [ngValue]="aluno.id">{{ aluno.nome }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Plano</label>
              <select [(ngModel)]="form.planoId" name="planoId" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue">
                <option [value]="null" disabled>Selecione um plano</option>
                @for (plano of planos(); track plano.id) {
                  <option [ngValue]="plano.id">{{ plano.nome }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Data Inicio</label>
              <input type="date" [(ngModel)]="form.dataInicio" name="dataInicio" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Data Validade</label>
              <input type="date" [(ngModel)]="form.dataValidade" name="dataValidade" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue" />
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
              <th class="text-left px-4 py-3 font-medium text-gray-700">Aluno</th>
              <th class="text-left px-4 py-3 font-medium text-gray-700">Plano</th>
              <th class="text-left px-4 py-3 font-medium text-gray-700">Inicio</th>
              <th class="text-left px-4 py-3 font-medium text-gray-700">Validade</th>
              <th class="text-left px-4 py-3 font-medium text-gray-700">Status</th>
              <th class="text-right px-4 py-3 font-medium text-gray-700">Acoes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            @for (contrato of contratos(); track contrato.id) {
              <tr>
                <td class="px-4 py-3">{{ contrato.alunoNome }}</td>
                <td class="px-4 py-3">{{ contrato.planoNome }}</td>
                <td class="px-4 py-3">{{ contrato.dataInicio }}</td>
                <td class="px-4 py-3">{{ contrato.dataValidade }}</td>
                <td class="px-4 py-3">
                  <span [class]="contrato.status === 'ATIVO' ? 'text-green-600' : 'text-red-500'">
                    {{ contrato.status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right space-x-2">
                  <button (click)="edit(contrato)" class="text-brand-blue hover:underline">Editar</button>
                  <button (click)="delete(contrato)" class="text-brand-alert hover:underline">Excluir</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
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
