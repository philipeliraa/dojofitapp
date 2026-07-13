import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { Plano } from '../../../core/models/plano.model';

@Component({
  selector: 'app-plano-list',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-brand-navy">Planos</h2>
        <button (click)="showForm.set(!showForm())" class="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-blue/90">
          {{ showForm() ? 'Cancelar' : 'Novo Plano' }}
        </button>
      </div>

      @if (showForm()) {
        <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
          <form (ngSubmit)="save()" class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input type="text" [(ngModel)]="form.nome" name="nome" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Limite Semanal (vazio = ilimitado)</label>
              <input type="number" [(ngModel)]="form.limiteSemanal" name="limiteSemanal"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue" />
            </div>
            <button type="submit" class="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-blue/90">
              {{ editingId ? 'Atualizar' : 'Criar' }}
            </button>
          </form>
        </div>
      }

      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-4 py-3 font-medium text-gray-700">Nome</th>
              <th class="text-left px-4 py-3 font-medium text-gray-700">Limite Semanal</th>
              <th class="text-left px-4 py-3 font-medium text-gray-700">Status</th>
              <th class="text-right px-4 py-3 font-medium text-gray-700">Acoes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            @for (plano of planos(); track plano.id) {
              <tr>
                <td class="px-4 py-3">{{ plano.nome }}</td>
                <td class="px-4 py-3">{{ plano.limiteSemanal ?? 'Ilimitado' }}</td>
                <td class="px-4 py-3">
                  <span [class]="plano.ativo ? 'text-green-600' : 'text-red-500'">
                    {{ plano.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right space-x-2">
                  <button (click)="edit(plano)" class="text-brand-blue hover:underline">Editar</button>
                  <button (click)="toggleAtivo(plano)" class="text-gray-500 hover:underline">
                    {{ plano.ativo ? 'Desativar' : 'Ativar' }}
                  </button>
                  <button (click)="delete(plano)" class="text-brand-alert hover:underline">Excluir</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class PlanoListComponent implements OnInit {
  planos = signal<Plano[]>([]);
  showForm = signal(false);
  editingId: number | null = null;
  form = { nome: '', limiteSemanal: null as number | null };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.http.get<Plano[]>(`${environment.apiUrl}/planos`).subscribe(data => this.planos.set(data));
  }

  save() {
    const body = { nome: this.form.nome, limiteSemanal: this.form.limiteSemanal || null };
    const req = this.editingId
      ? this.http.put(`${environment.apiUrl}/planos/${this.editingId}`, body)
      : this.http.post(`${environment.apiUrl}/planos`, body);

    req.subscribe(() => {
      this.resetForm();
      this.load();
    });
  }

  edit(plano: Plano) {
    this.editingId = plano.id;
    this.form = { nome: plano.nome, limiteSemanal: plano.limiteSemanal };
    this.showForm.set(true);
  }

  toggleAtivo(plano: Plano) {
    this.http.patch(`${environment.apiUrl}/planos/${plano.id}/toggle`, {}).subscribe(() => this.load());
  }

  delete(plano: Plano) {
    if (!confirm(`Excluir o plano "${plano.nome}"?`)) return;
    this.http.delete(`${environment.apiUrl}/planos/${plano.id}`).subscribe({
      next: () => this.load(),
      error: (err) => alert(err.error?.message || 'Erro ao excluir plano.')
    });
  }

  resetForm() {
    this.editingId = null;
    this.form = { nome: '', limiteSemanal: null };
    this.showForm.set(false);
  }
}
