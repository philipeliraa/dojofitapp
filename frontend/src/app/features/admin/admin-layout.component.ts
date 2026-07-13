import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-brand-bg flex">
      <aside class="w-56 bg-brand-navy min-h-screen p-4 hidden md:block">
        <div class="flex items-center gap-2 mb-6">
          <svg width="28" height="28" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#042C53"/><g transform="translate(20,20)"><rect x="-14" y="-4" width="28" height="8" rx="4" fill="#E24B4A" transform="rotate(20)"/><rect x="-14" y="-4" width="28" height="8" rx="4" fill="#FAFAF8" transform="rotate(-20)"/></g></svg>
          <h1 class="text-lg font-bold text-white">DojoFit Admin</h1>
        </div>
        <nav class="space-y-1">
          <a routerLink="/admin" routerLinkActive="text-brand-blue" [routerLinkActiveOptions]="{exact: true}"
             class="block px-3 py-2 rounded-lg text-sm text-brand-navy-light hover:text-white">Dashboard</a>
          <a routerLink="/admin/planos" routerLinkActive="text-brand-blue"
             class="block px-3 py-2 rounded-lg text-sm text-brand-navy-light hover:text-white">Planos</a>
          <a routerLink="/admin/turmas" routerLinkActive="text-brand-blue"
             class="block px-3 py-2 rounded-lg text-sm text-brand-navy-light hover:text-white">Turmas</a>
          <a routerLink="/admin/usuarios" routerLinkActive="text-brand-blue"
             class="block px-3 py-2 rounded-lg text-sm text-brand-navy-light hover:text-white">Usuarios</a>
          <a routerLink="/admin/contratos" routerLinkActive="text-brand-blue"
             class="block px-3 py-2 rounded-lg text-sm text-brand-navy-light hover:text-white">Contratos</a>
          <a routerLink="/admin/aulas" routerLinkActive="text-brand-blue"
             class="block px-3 py-2 rounded-lg text-sm text-brand-navy-light hover:text-white">Aulas</a>
        </nav>
        <button (click)="authService.logout()" class="mt-8 text-sm text-brand-navy-light hover:text-white">Sair</button>
      </aside>

      <div class="flex-1">
        <header class="bg-brand-navy shadow-sm px-4 py-3 md:hidden flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#042C53"/><g transform="translate(20,20)"><rect x="-14" y="-4" width="28" height="8" rx="4" fill="#E24B4A" transform="rotate(20)"/><rect x="-14" y="-4" width="28" height="8" rx="4" fill="#FAFAF8" transform="rotate(-20)"/></g></svg>
            <h1 class="text-lg font-bold text-white">DojoFit Admin</h1>
          </div>
          <button (click)="authService.logout()" class="text-sm text-brand-navy-light">Sair</button>
        </header>
        <main class="p-4 md:p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {
  constructor(public authService: AuthService) {}
}
