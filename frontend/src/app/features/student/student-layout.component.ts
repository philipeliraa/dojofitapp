import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-brand-bg pb-16">
      <header class="bg-brand-navy px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="20" fill="#042C53"/>
            <g transform="translate(20,20)">
              <rect x="-14" y="-4" width="28" height="8" rx="4" fill="#E24B4A" transform="rotate(20)"/>
              <rect x="-14" y="-4" width="28" height="8" rx="4" fill="#FAFAF8" transform="rotate(-20)"/>
            </g>
          </svg>
          <h1 class="text-lg font-bold text-white">DojoFit</h1>
        </div>
        <button (click)="authService.logout()" class="text-sm text-brand-navy-light hover:text-white">Sair</button>
      </header>

      <main class="p-4">
        <router-outlet />
      </main>

      <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2">
        <a routerLink="/student" routerLinkActive="text-brand-blue" [routerLinkActiveOptions]="{exact: true}"
           class="flex flex-col items-center text-xs text-gray-500">
          <span class="text-lg">🏠</span>
          <span>Inicio</span>
        </a>
        <a routerLink="/student/schedule" routerLinkActive="text-brand-blue"
           class="flex flex-col items-center text-xs text-gray-500">
          <span class="text-lg">📅</span>
          <span>Grade</span>
        </a>
        <a routerLink="/student/history" routerLinkActive="text-brand-blue"
           class="flex flex-col items-center text-xs text-gray-500">
          <span class="text-lg">📋</span>
          <span>Historico</span>
        </a>
        <a routerLink="/student/contract" routerLinkActive="text-brand-blue"
           class="flex flex-col items-center text-xs text-gray-500">
          <span class="text-lg">📄</span>
          <span>Contrato</span>
        </a>
      </nav>
    </div>
  `,
})
export class StudentLayoutComponent {
  constructor(public authService: AuthService) {}
}
