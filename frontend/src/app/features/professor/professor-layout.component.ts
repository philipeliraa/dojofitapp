import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-professor-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-brand-bg">
      <header class="bg-brand-navy shadow-sm px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#042C53"/><g transform="translate(20,20)"><rect x="-14" y="-4" width="28" height="8" rx="4" fill="#E24B4A" transform="rotate(20)"/><rect x="-14" y="-4" width="28" height="8" rx="4" fill="#FAFAF8" transform="rotate(-20)"/></g></svg>
          <h1 class="text-lg font-bold text-white">DojoFit</h1>
        </div>
        <button (click)="authService.logout()" class="text-sm text-brand-navy-light hover:text-white">Sair</button>
      </header>

      <nav class="bg-white border-b px-4 py-2 flex gap-4">
        <a routerLink="/professor" routerLinkActive="text-brand-blue font-medium" [routerLinkActiveOptions]="{exact: true}"
           class="text-sm text-gray-600">Chamada</a>
        <a routerLink="/professor/schedule" routerLinkActive="text-brand-blue font-medium"
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
