import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">DojoFit</h1>
          <p class="text-gray-500 mt-1">Sistema de Check-in</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          <form (ngSubmit)="onLogin()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              [disabled]="loading()"
              class="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {{ loading() ? 'Entrando...' : 'Entrar' }}
            </button>
          </form>

          <div class="mt-4 text-center">
            <p class="text-sm text-gray-500">
              Nao tem conta?
              <a routerLink="/register" class="text-blue-600 hover:underline">Cadastre-se</a>
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

  constructor(private authService: AuthService) {}

  onLogin() {
    if (!this.email || !this.senha) return;
    this.loading.set(true);
    this.authService.login(this.email, this.senha);
  }
}
