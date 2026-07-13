import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { Usuario, Role } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-brand-navy">Usuarios</h2>
        <button (click)="showForm.set(!showForm())" class="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-blue/90">
          {{ showForm() ? 'Cancelar' : 'Novo Usuario' }}
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
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" [(ngModel)]="form.email" name="email" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input type="password" [(ngModel)]="form.senha" name="senha" [required]="!editingId"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue"
                placeholder="{{ editingId ? 'Deixe vazio para manter' : '' }}" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
              <select [(ngModel)]="form.role" name="role" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue">
                <option value="ALUNO">Aluno</option>
                <option value="PROFESSOR">Professor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div class="sm:col-span-2">
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
              <th class="text-left px-4 py-3 font-medium text-gray-700">Email</th>
              <th class="text-left px-4 py-3 font-medium text-gray-700">Perfil</th>
              <th class="text-left px-4 py-3 font-medium text-gray-700">Status</th>
              <th class="text-right px-4 py-3 font-medium text-gray-700">Acoes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            @for (user of usuarios(); track user.id) {
              <tr>
                <td class="px-4 py-3">{{ user.nome }}</td>
                <td class="px-4 py-3">{{ user.email }}</td>
                <td class="px-4 py-3">{{ user.role }}</td>
                <td class="px-4 py-3">
                  <span [class]="user.ativo ? 'text-green-600' : 'text-red-500'">
                    {{ user.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right space-x-2">
                  <button (click)="edit(user)" class="text-brand-blue hover:underline">Editar</button>
                  <button (click)="toggleAtivo(user)" class="text-gray-500 hover:underline">
                    {{ user.ativo ? 'Desativar' : 'Ativar' }}
                  </button>
                  <button (click)="delete(user)" class="text-brand-alert hover:underline">Excluir</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class UsuarioListComponent implements OnInit {
  usuarios = signal<Usuario[]>([]);
  showForm = signal(false);
  editingId: number | null = null;
  form = { nome: '', email: '', senha: '', role: 'ALUNO' as Role };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.http.get<Usuario[]>(`${environment.apiUrl}/admin/usuarios`).subscribe(data => this.usuarios.set(data));
  }

  save() {
    const body: any = { nome: this.form.nome, email: this.form.email, role: this.form.role };
    if (this.form.senha) body.senha = this.form.senha;

    const req = this.editingId
      ? this.http.put(`${environment.apiUrl}/admin/usuarios/${this.editingId}`, body)
      : this.http.post(`${environment.apiUrl}/admin/usuarios`, body);

    req.subscribe(() => {
      this.resetForm();
      this.load();
    });
  }

  edit(user: Usuario) {
    this.editingId = user.id;
    this.form = { nome: user.nome, email: user.email, senha: '', role: user.role };
    this.showForm.set(true);
  }

  toggleAtivo(user: Usuario) {
    this.http.patch(`${environment.apiUrl}/admin/usuarios/${user.id}/toggle-ativo`, {}).subscribe(() => this.load());
  }

  delete(user: Usuario) {
    if (!confirm(`Excluir o usuario "${user.nome}"?`)) return;
    this.http.delete(`${environment.apiUrl}/admin/usuarios/${user.id}`).subscribe({
      next: () => this.load(),
      error: (err) => alert(err.error?.message || 'Erro ao excluir usuario.')
    });
  }

  resetForm() {
    this.editingId = null;
    this.form = { nome: '', email: '', senha: '', role: 'ALUNO' };
    this.showForm.set(false);
  }
}
