import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { Usuario, Role } from '../../../core/models/usuario.model';
import { DojofitButtonComponent } from '../../../shared/components/base/dojofit-button.component';
import { DojofitInputComponent } from '../../../shared/components/base/dojofit-input.component';
import { DojofitFormGroupComponent } from '../components/dojofit-form-group.component';
import { DojofitDataTableComponent, DojofitColumnDef } from '../components/dojofit-data-table.component';

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
  imports: [FormsModule, DojofitButtonComponent, DojofitInputComponent, DojofitFormGroupComponent, DojofitDataTableComponent],
  template: `
    <div>
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-title text-primary">Usuarios</h2>
        <div class="flex gap-2">
          <dojofit-button variant="secondary" (onClick)="showInviteForm.set(!showInviteForm())">
            {{ showInviteForm() ? 'Fechar convite' : 'Convidar' }}
          </dojofit-button>
          <dojofit-button (onClick)="showForm.set(!showForm())">
            {{ showForm() ? 'Cancelar' : 'Novo Usuario' }}
          </dojofit-button>
        </div>
      </div>

      @if (showInviteForm()) {
        <div class="mb-6">
          <dojofit-form-group label="Convidar por link — o papel é definido aqui, nunca pelo convidado">
            <form (ngSubmit)="criarConvite()" class="col-span-full flex flex-wrap items-end gap-3">
              <div class="min-w-48 flex-1">
                <dojofit-input label="Email do convidado" type="email" [(value)]="inviteForm.email" />
              </div>
              <div>
                <label class="mb-1 block text-label text-primary">Papel</label>
                <select [(ngModel)]="inviteForm.role" name="inviteRole" required
                  class="rounded-button border border-default bg-surface-base px-3 py-2 text-body text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
                  <option value="ALUNO">Aluno</option>
                  <option value="PROFESSOR">Professor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <dojofit-button [loading]="inviteLoading()" (onClick)="criarConvite()">Gerar link</dojofit-button>
            </form>

            @if (inviteError()) {
              <p class="col-span-full text-body text-brand-alert">{{ inviteError() }}</p>
            }

            @if (inviteLink()) {
              <div class="col-span-full flex items-center gap-2">
                <input type="text" [value]="inviteLink()" readonly
                  class="flex-1 rounded-button border border-default bg-surface-body px-3 py-2 text-caption text-secondary outline-none" />
                <button type="button" (click)="copiarLink()" class="text-body text-brand-blue hover:underline">
                  {{ linkCopiado() ? 'Copiado!' : 'Copiar' }}
                </button>
              </div>
              <p class="col-span-full text-caption text-secondary">Envie este link ao convidado — válido por 7 dias, uso único.</p>
            }

            @if (convites().length > 0) {
              <div class="col-span-full border-t border-default pt-3">
                <p class="mb-2 text-caption font-medium text-secondary">Convites pendentes</p>
                @for (convite of convites(); track convite.id) {
                  <div class="flex items-center justify-between py-1 text-body">
                    <span class="text-primary">{{ convite.email }} <span class="text-secondary">({{ convite.role }})</span></span>
                    <button type="button" (click)="copiarLinkDe(convite)" class="text-caption text-brand-blue hover:underline">Copiar link</button>
                  </div>
                }
              </div>
            }
          </dojofit-form-group>
        </div>
      }

      @if (showForm()) {
        <div class="mb-6">
          <dojofit-form-group>
            <form (ngSubmit)="save()" class="col-span-full grid grid-cols-1 gap-3 sm:grid-cols-2">
              <dojofit-input label="Nome" [(value)]="form.nome" />
              <dojofit-input label="Email" type="email" [(value)]="form.email" />
              <dojofit-input label="Senha" type="password" [(value)]="form.senha" />
              <div>
                <label class="mb-1 block text-label text-primary">Perfil</label>
                <select [(ngModel)]="form.role" name="role" required
                  class="w-full rounded-button border border-default bg-surface-base px-3 py-2 text-body text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
                  <option value="ALUNO">Aluno</option>
                  <option value="PROFESSOR">Professor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div class="sm:col-span-2">
                <dojofit-button (onClick)="save()">{{ editingId ? 'Atualizar' : 'Criar' }}</dojofit-button>
              </div>
            </form>
          </dojofit-form-group>
        </div>
      }

      <dojofit-data-table [columns]="columns" [rows]="usuarios()" emptyStateMessage="Nenhum usuário cadastrado.">
        <ng-template #rowActions let-user>
          <button (click)="edit(user)" class="text-caption text-brand-blue hover:underline">Editar</button>
          <button (click)="toggleAtivo(user)" class="ml-2 text-caption text-secondary hover:underline">
            {{ user.ativo ? 'Desativar' : 'Ativar' }}
          </button>
          <button (click)="delete(user)" class="ml-2 text-caption text-brand-alert hover:underline">Excluir</button>
        </ng-template>
      </dojofit-data-table>
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

  columns: DojofitColumnDef<Usuario>[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Perfil' },
    { key: 'ativo', label: 'Status', render: (u) => (u.ativo ? 'Ativo' : 'Inativo') },
  ];

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
