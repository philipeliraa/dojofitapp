import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { Usuario, Role } from '../../../core/models/usuario.model';

interface Convite {
  id: number;
  token: string;
  email: string;
  role: Role;
  expiraEm: string;
}

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-brand-navy">Usuarios</h2>
        <div class="space-x-2">
          <button (click)="showInviteForm.set(!showInviteForm())" class="border border-brand-blue text-brand-blue px-4 py-2 rounded-lg text-sm hover:bg-brand-blue/10">
            {{ showInviteForm() ? 'Fechar convite' : 'Convidar' }}
          </button>
          <button (click)="showForm.set(!showForm())" class="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-blue/90">
            {{ showForm() ? 'Cancelar' : 'Novo Usuario' }}
          </button>
        </div>
      </div>

      @if (showInviteForm()) {
        <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h3 class="text-sm font-medium text-gray-700 mb-3">Convidar por link — o papel é definido aqui, nunca pelo convidado</h3>
          <form (ngSubmit)="criarConvite()" class="flex flex-wrap gap-3 items-end">
            <div class="flex-1 min-w-48">
              <label class="block text-sm font-medium text-gray-700 mb-1">Email do convidado</label>
              <input type="email" [(ngModel)]="inviteForm.email" name="inviteEmail" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Papel</label>
              <select [(ngModel)]="inviteForm.role" name="inviteRole" required
                class="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue">
                <option value="ALUNO">Aluno</option>
                <option value="PROFESSOR">Professor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <button type="submit" [disabled]="inviteLoading()"
              class="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-blue/90 disabled:opacity-50">
              {{ inviteLoading() ? 'Gerando...' : 'Gerar link' }}
            </button>
          </form>

          @if (inviteError()) {
            <p class="text-sm text-brand-alert mt-3">{{ inviteError() }}</p>
          }

          @if (inviteLink()) {
            <div class="mt-4 flex items-center gap-2">
              <input type="text" [value]="inviteLink()" readonly
                class="flex-1 px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-xs text-gray-600 outline-none" />
              <button type="button" (click)="copiarLink()" class="text-brand-blue text-sm hover:underline">
                {{ linkCopiado() ? 'Copiado!' : 'Copiar' }}
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-1">Envie este link ao convidado — válido por 7 dias, uso único.</p>
          }

          @if (convites().length > 0) {
            <div class="mt-4 border-t border-gray-100 pt-3">
              <p class="text-xs font-medium text-gray-500 mb-2">Convites pendentes</p>
              @for (convite of convites(); track convite.id) {
                <div class="flex items-center justify-between py-1 text-sm">
                  <span class="text-gray-700">{{ convite.email }} <span class="text-gray-400">({{ convite.role }})</span></span>
                  <button type="button" (click)="copiarLinkDe(convite)" class="text-brand-blue text-xs hover:underline">Copiar link</button>
                </div>
              }
            </div>
          }
        </div>
      }

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

  convites = signal<Convite[]>([]);
  showInviteForm = signal(false);
  inviteForm = { email: '', role: 'ALUNO' as Role };
  inviteLoading = signal(false);
  inviteError = signal('');
  inviteLink = signal('');
  linkCopiado = signal(false);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.load();
    this.loadConvites();
  }

  load() {
    this.http.get<Usuario[]>(`${environment.apiUrl}/admin/usuarios`).subscribe(data => this.usuarios.set(data));
  }

  loadConvites() {
    this.http.get<Convite[]>(`${environment.apiUrl}/convites`).subscribe(data => this.convites.set(data));
  }

  criarConvite() {
    if (!this.inviteForm.email) return;
    this.inviteLoading.set(true);
    this.inviteError.set('');
    this.inviteLink.set('');
    this.linkCopiado.set(false);

    this.http.post<Convite>(`${environment.apiUrl}/convites`, this.inviteForm).subscribe({
      next: convite => {
        this.inviteLoading.set(false);
        this.inviteLink.set(this.linkDe(convite));
        this.inviteForm = { email: '', role: 'ALUNO' };
        this.loadConvites();
      },
      error: err => {
        this.inviteLoading.set(false);
        this.inviteError.set(err.error?.error || 'Erro ao gerar convite.');
      },
    });
  }

  copiarLink() {
    navigator.clipboard.writeText(this.inviteLink()).then(() => this.linkCopiado.set(true));
  }

  copiarLinkDe(convite: Convite) {
    navigator.clipboard.writeText(this.linkDe(convite));
  }

  private linkDe(convite: Convite): string {
    return `${location.origin}/register?convite=${convite.token}`;
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
