import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * Área de Gestão (docs/02 seção 2 e 3): sub-navegação em abas. O Professor tem
 * acesso parcial — só a aba Alunos (coaching/graduação, Fase 3a). O Admin vê
 * todas as abas. As rotas em si também são protegidas por guard de papel.
 */
@Component({
  selector: 'app-gestao-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div>
      <nav class="mb-4 flex gap-4 overflow-x-auto border-b border-default pb-2">
        <a routerLink="/gestao/alunos" routerLinkActive="text-brand-blue font-medium" class="whitespace-nowrap text-body text-secondary">Alunos</a>
        @if (ehAdmin()) {
          <a routerLink="/gestao/usuarios" routerLinkActive="text-brand-blue font-medium" class="whitespace-nowrap text-body text-secondary">Usuários</a>
          <a routerLink="/gestao/turmas" routerLinkActive="text-brand-blue font-medium" class="whitespace-nowrap text-body text-secondary">Turmas</a>
          <a routerLink="/gestao/aulas" routerLinkActive="text-brand-blue font-medium" class="whitespace-nowrap text-body text-secondary">Aulas</a>
          <a routerLink="/gestao/planos" routerLinkActive="text-brand-blue font-medium" class="whitespace-nowrap text-body text-secondary">Planos</a>
          <a routerLink="/gestao/contratos" routerLinkActive="text-brand-blue font-medium" class="whitespace-nowrap text-body text-secondary">Contratos</a>
          <a routerLink="/gestao/modalidades" routerLinkActive="text-brand-blue font-medium" class="whitespace-nowrap text-body text-secondary">Modalidades</a>
        }
      </nav>
      <router-outlet />
    </div>
  `,
})
export class GestaoLayoutComponent {
  private readonly authService = inject(AuthService);
  protected readonly ehAdmin = computed(() => this.authService.role() === 'ADMIN');
}
