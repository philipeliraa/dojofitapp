import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { Plano } from '../../../core/models/plano.model';
import { DojofitButtonComponent } from '../../../shared/components/base/dojofit-button.component';
import { DojofitInputComponent } from '../../../shared/components/base/dojofit-input.component';
import { DojofitFormGroupComponent } from '../components/dojofit-form-group.component';
import { DojofitDataTableComponent, DojofitColumnDef } from '../components/dojofit-data-table.component';

@Component({
  selector: 'app-plano-list',
  standalone: true,
  imports: [FormsModule, DojofitButtonComponent, DojofitInputComponent, DojofitFormGroupComponent, DojofitDataTableComponent],
  template: `
    <div>
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-title text-primary">Planos</h2>
        <dojofit-button (onClick)="showForm.set(!showForm())">
          {{ showForm() ? 'Cancelar' : 'Novo Plano' }}
        </dojofit-button>
      </div>

      @if (showForm()) {
        <div class="mb-6">
          <dojofit-form-group>
            <form (ngSubmit)="save()" class="col-span-full grid grid-cols-1 gap-3 sm:grid-cols-2">
              <dojofit-input label="Nome" [(value)]="form.nome" />
              <dojofit-input label="Limite Semanal (vazio = ilimitado)" type="number" [(value)]="form.limiteSemanalStr" />
              <div class="sm:col-span-2">
                <dojofit-button (onClick)="save()">{{ editingId ? 'Atualizar' : 'Criar' }}</dojofit-button>
              </div>
            </form>
          </dojofit-form-group>
        </div>
      }

      <dojofit-data-table [columns]="columns" [rows]="planos()" emptyStateMessage="Nenhum plano cadastrado.">
        <ng-template #rowActions let-plano>
          <button (click)="edit(plano)" class="text-caption text-brand-blue hover:underline">Editar</button>
          <button (click)="toggleAtivo(plano)" class="ml-2 text-caption text-secondary hover:underline">
            {{ plano.ativo ? 'Desativar' : 'Ativar' }}
          </button>
          <button (click)="delete(plano)" class="ml-2 text-caption text-brand-alert hover:underline">Excluir</button>
        </ng-template>
      </dojofit-data-table>
    </div>
  `,
})
export class PlanoListComponent implements OnInit {
  planos = signal<Plano[]>([]);
  showForm = signal(false);
  editingId: number | null = null;
  form = { nome: '', limiteSemanalStr: '' };

  columns: DojofitColumnDef<Plano>[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'limiteSemanal', label: 'Limite Semanal', render: (p) => p.limiteSemanal == null ? 'Ilimitado' : String(p.limiteSemanal) },
    { key: 'ativo', label: 'Status', render: (p) => (p.ativo ? 'Ativo' : 'Inativo') },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.http.get<Plano[]>(`${environment.apiUrl}/planos`).subscribe(data => this.planos.set(data));
  }

  save() {
    const body = { nome: this.form.nome, limiteSemanal: this.form.limiteSemanalStr ? Number(this.form.limiteSemanalStr) : null };
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
    this.form = { nome: plano.nome, limiteSemanalStr: plano.limiteSemanal != null ? String(plano.limiteSemanal) : '' };
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
    this.form = { nome: '', limiteSemanalStr: '' };
    this.showForm.set(false);
  }
}
