import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-50 pb-16">
      <header class="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <h1 class="text-lg font-bold text-gray-900">DojoFit</h1>
        <button (click)="authService.logout()" class="text-sm text-gray-500 hover:text-gray-700">Sair</button>
      </header>

      <main class="p-4">
        <router-outlet />
      </main>

      <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2">
        <a routerLink="/student" routerLinkActive="text-blue-600" [routerLinkActiveOptions]="{exact: true}"
           class="flex flex-col items-center text-xs text-gray-500">
          <span class="text-lg">🏠</span>
          <span>Inicio</span>
        </a>
        <a routerLink="/student/schedule" routerLinkActive="text-blue-600"
           class="flex flex-col items-center text-xs text-gray-500">
          <span class="text-lg">📅</span>
          <span>Grade</span>
        </a>
        <a routerLink="/student/history" routerLinkActive="text-blue-600"
           class="flex flex-col items-center text-xs text-gray-500">
          <span class="text-lg">📋</span>
          <span>Historico</span>
        </a>
        <a routerLink="/student/contract" routerLinkActive="text-blue-600"
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
