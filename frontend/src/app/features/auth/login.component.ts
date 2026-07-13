import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
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
          <p class="text-gray-500 mt-1">Sistema de Check-in</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          @if (error()) {
            <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-brand-alert">
              {{ error() }}
            </div>
          }

          <form (ngSubmit)="onLogin()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                [(ngModel)]="senha"
                name="senha"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              [disabled]="loading()"
              class="w-full bg-brand-blue text-white py-2.5 rounded-lg font-medium hover:bg-brand-blue/90 disabled:opacity-50 transition"
            >
              {{ loading() ? 'Entrando...' : 'Entrar' }}
            </button>
          </form>

          <div class="mt-4 text-center">
            <p class="text-sm text-gray-500">
              Nao tem conta?
              <a routerLink="/register" class="text-brand-blue hover:underline">Cadastre-se</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  senha = '';
  loading = signal(false);
  error = signal('');

  constructor(private authService: AuthService) {}

  onLogin() {
    if (!this.email || !this.senha) return;
    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.email, this.senha).subscribe({
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
