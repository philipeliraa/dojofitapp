import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-50 flex">
      <aside class="w-56 bg-white border-r min-h-screen p-4 hidden md:block">
        <h1 class="text-lg font-bold text-gray-900 mb-6">DojoFit Admin</h1>
        <nav class="space-y-1">
          <a routerLink="/admin" routerLinkActive="bg-blue-50 text-blue-700" [routerLinkActiveOptions]="{exact: true}"
             class="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Dashboard</a>
          <a routerLink="/admin/planos" routerLinkActive="bg-blue-50 text-blue-700"
             class="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Planos</a>
          <a routerLink="/admin/turmas" routerLinkActive="bg-blue-50 text-blue-700"
             class="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Turmas</a>
          <a routerLink="/admin/usuarios" routerLinkActive="bg-blue-50 text-blue-700"
             class="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Usuarios</a>
          <a routerLink="/admin/contratos" routerLinkActive="bg-blue-50 text-blue-700"
             class="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Contratos</a>
          <a routerLink="/admin/aulas" routerLinkActive="bg-blue-50 text-blue-700"
             class="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Aulas</a>
        </nav>
        <button (click)="authService.logout()" class="mt-8 text-sm text-gray-500 hover:text-gray-700">Sair</button>
      </aside>

      <div class="flex-1">
        <header class="bg-white shadow-sm px-4 py-3 md:hidden flex items-center justify-between">
          <h1 class="text-lg font-bold text-gray-900">DojoFit Admin</h1>
          <button (click)="authService.logout()" class="text-sm text-gray-500">Sair</button>
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
