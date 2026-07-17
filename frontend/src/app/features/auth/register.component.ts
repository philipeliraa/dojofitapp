import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * Cadastro exclusivo por convite (docs/02 seção 5, docs/06 fluxo 2):
 * sem token válido na URL, o acesso é bloqueado com a mensagem padrão.
 * O e-mail vem do convite e não é editável; o papel nunca é escolhido aqui.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <div class="flex justify-center mb-3">
            <svg width="48" height="48" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#042C53"/><g transform="translate(20,20)"><rect x="-14" y="-4" width="28" height="8" rx="4" fill="#E24B4A" transform="rotate(20)"/><rect x="-14" y="-4" width="28" height="8" rx="4" fill="#FAFAF8" transform="rotate(-20)"/></g></svg>
          </div>
          <h1 class="text-3xl font-bold text-brand-navy">DojoFit</h1>
          <p class="text-gray-500 mt-1">Criar conta</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          @if (validandoConvite()) {
            <p class="text-sm text-gray-500 text-center py-4">Validando convite...</p>
          } @else if (conviteInvalido()) {
            <div class="text-center py-2">
              <p class="text-sm text-brand-alert mb-2">{{ conviteInvalido() }}</p>
              <p class="text-sm text-gray-500 mb-4">
                O acesso ao Dojofit depende de um convite da sua academia.
                Fale com seu professor ou administrador.
              </p>
              <a routerLink="/login" class="text-brand-blue text-sm hover:underline">Voltar ao login</a>
            </div>
          } @else {
            @if (error()) {
              <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-brand-alert">
                {{ error() }}
              </div>
            }

            <form (ngSubmit)="onRegister()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  [value]="emailConvite()"
                  name="email"
                  disabled
                  class="w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg outline-none cursor-not-allowed"
                />
                <p class="text-xs text-gray-400 mt-1">Definido pelo convite da academia</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  [(ngModel)]="nome"
                  name="nome"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input
                  type="password"
                  [(ngModel)]="senha"
                  name="senha"
                  required
                  minlength="6"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                  placeholder="Minimo 6 caracteres"
                />
              </div>

              <button
                type="submit"
                [disabled]="loading()"
                class="w-full bg-brand-blue text-white py-2.5 rounded-lg font-medium hover:bg-brand-blue/90 disabled:opacity-50 transition"
              >
                {{ loading() ? 'Criando...' : 'Criar conta' }}
              </button>
            </form>

            <div class="mt-4 text-center">
              <p class="text-sm text-gray-500">
                Ja tem conta?
                <a routerLink="/login" class="text-brand-blue hover:underline">Entrar</a>
              </p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent implements OnInit {
  nome = '';
  senha = '';
  loading = signal(false);
  error = signal('');
  validandoConvite = signal(true);
  conviteInvalido = signal('');
  emailConvite = signal('');

  private conviteToken = '';

  constructor(private authService: AuthService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.conviteToken = this.route.snapshot.queryParamMap.get('convite') ?? '';

    if (!this.conviteToken) {
      this.validandoConvite.set(false);
      this.conviteInvalido.set('Acesso requer convite');
      return;
    }

    this.authService.getConvitePreview(this.conviteToken).subscribe({
      next: preview => {
        this.emailConvite.set(preview.email);
        this.validandoConvite.set(false);
      },
      error: err => {
        this.validandoConvite.set(false);
        this.conviteInvalido.set(err.error?.error || 'Convite invalido');
      },
    });
  }

  onRegister() {
    if (!this.nome || !this.senha) return;
    this.loading.set(true);
    this.error.set('');

    this.authService.register(this.nome, this.senha, this.conviteToken).subscribe({
      next: (res) => {
        this.authService.handleAuth(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.error || err.error?.message || (err.status === 0 ? 'Sem conexao com o servidor' : `Erro ${err.status}: ${err.statusText}`);
        this.error.set(msg);
      },
    });
  }
}
