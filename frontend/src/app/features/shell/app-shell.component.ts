import { Component, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, LucideIconData, House, Calendar, Megaphone, Trophy, User, Settings } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { DojofitAvatarComponent } from '../../shared/components/base/dojofit-avatar.component';
import { NotificacaoBellComponent } from '../notificacoes/notificacao-bell.component';
import { iniciaisDoNome } from '../../core/utils/nome.util';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIconData;
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
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule, DojofitAvatarComponent, NotificacaoBellComponent],
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
          <app-notificacao-bell />
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
            <lucide-icon [img]="item.icon" [size]="20" aria-hidden="true" />
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
      { path: '/', label: 'Início', icon: House, exact: true },
      { path: '/calendario', label: 'Calendário', icon: Calendar, exact: false },
      { path: '/mural', label: 'Mural', icon: Megaphone, exact: false },
      { path: '/ranking', label: 'Ranking', icon: Trophy, exact: false },
      { path: '/perfil', label: 'Perfil', icon: User, exact: false },
    ];

    // Gestão é visível para Professor (acesso parcial: Alunos/coaching) e Admin
    // (completo) — docs/02 seção 2. As seções internas restringem por papel.
    const role = this.authService.role();
    if (role === 'ADMIN' || role === 'PROFESSOR') {
      items.push({ path: '/gestao', label: 'Gestão', icon: Settings, exact: false });
    }

    return items;
  });
}
