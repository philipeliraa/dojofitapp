import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-professor-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <h1 class="text-lg font-bold text-gray-900">DojoFit - Professor</h1>
        <button (click)="authService.logout()" class="text-sm text-gray-500 hover:text-gray-700">Sair</button>
      </header>

      <nav class="bg-white border-b px-4 py-2 flex gap-4">
        <a routerLink="/professor" routerLinkActive="text-blue-600 font-medium" [routerLinkActiveOptions]="{exact: true}"
           class="text-sm text-gray-600">Chamada</a>
        <a routerLink="/professor/schedule" routerLinkActive="text-blue-600 font-medium"
           class="text-sm text-gray-600">Grade</a>
      </nav>

      <main class="p-4">
        <router-outlet />
      </main>
    </div>
  `,
})
export class ProfessorLayoutComponent {
  constructor(public authService: AuthService) {}
}
