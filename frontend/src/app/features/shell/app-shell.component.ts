import { Component, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DojofitAvatarComponent } from '../../shared/components/base/dojofit-avatar.component';
import { iniciaisDoNome } from '../../core/utils/nome.util';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  exact: boolean;
}

/**
 * Casca única de navegação (docs/02 seção 1): substitui os 3 layouts
 * separados (student/professor/admin layout) que existiam antes — mesma
 * interface para todos os papéis, nav mostra/esconde itens por papel,
 * nunca telas ou apps separados.
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DojofitAvatarComponent],
  template: `
    <div class="min-h-screen bg-surface-body pb-16">
      <header class="flex items-center justify-between bg-brand-navy px-4 py-3">
        <div class="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="20" fill="#042C53" />
            <g transform="translate(20,20)">
              <rect x="-14" y="-4" width="28" height="8" rx="4" fill="#E24B4A" transform="rotate(20)" />
              <rect x="-14" y="-4" width="28" height="8" rx="4" fill="#FAFAF8" transform="rotate(-20)" />
            </g>
          </svg>
          <h1 class="text-lg font-bold text-white">Dojofit</h1>
        </div>

        <div class="flex items-center gap-3">
          @if (initials(); as i) {
            <dojofit-avatar [initials]="i" size="sm" />
          }
          <button (click)="authService.logout()" class="text-sm text-white/70 hover:text-white">Sair</button>
        </div>
      </header>

      <main class="p-4">
        <router-outlet />
      </main>

      <nav class="fixed bottom-0 left-0 right-0 flex justify-around border-t border-default bg-surface-base py-2">
        @for (item of navItems(); track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="text-brand-blue"
            [routerLinkActiveOptions]="{ exact: item.exact }"
            class="flex flex-col items-center text-xs text-secondary"
          >
            <span class="text-lg" aria-hidden="true">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>
    </div>
  `,
})
export class AppShellComponent {
  constructor(public authService: AuthService) {}

  protected readonly initials = computed(() => iniciaisDoNome(this.authService.user()?.nome));

  protected readonly navItems = computed<NavItem[]>(() => {
    const items: NavItem[] = [
      { path: '/', label: 'Início', icon: '🏠', exact: true },
      { path: '/calendario', label: 'Calendário', icon: '📅', exact: false },
      { path: '/mural', label: 'Mural', icon: '📣', exact: false },
      { path: '/perfil', label: 'Perfil', icon: '👤', exact: false },
    ];

    // Gestão é visível para Professor (acesso parcial) e Admin (completo)
    // — docs/02 seção 2. Hoje só as rotas do Admin existem (seção 4);
    // acesso parcial do Professor (Turmas/Alunos em leitura) é trabalho futuro.
    if (this.authService.role() === 'ADMIN') {
      items.push({ path: '/gestao', label: 'Gestão', icon: '⚙️', exact: false });
    }

    return items;
  });
}
