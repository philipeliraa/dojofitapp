import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

/**
 * Área de Gestão (docs/02 seção 3): sub-navegação em abas entre Usuários,
 * Turmas, Aulas, Planos e Contratos — substitui o antigo AdminDashboardComponent
 * (cards de atalho), que virou código morto e foi removido.
 */
@Component({
  selector: 'app-gestao-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div>
      <nav class="mb-4 flex gap-4 overflow-x-auto border-b border-default pb-2">
        <a routerLink="/gestao/usuarios" routerLinkActive="text-brand-blue font-medium" class="whitespace-nowrap text-body text-secondary">Usuários</a>
        <a routerLink="/gestao/turmas" routerLinkActive="text-brand-blue font-medium" class="whitespace-nowrap text-body text-secondary">Turmas</a>
        <a routerLink="/gestao/aulas" routerLinkActive="text-brand-blue font-medium" class="whitespace-nowrap text-body text-secondary">Aulas</a>
        <a routerLink="/gestao/planos" routerLinkActive="text-brand-blue font-medium" class="whitespace-nowrap text-body text-secondary">Planos</a>
        <a routerLink="/gestao/contratos" routerLinkActive="text-brand-blue font-medium" class="whitespace-nowrap text-body text-secondary">Contratos</a>
      </nav>
      <router-outlet />
    </div>
  `,
})
export class GestaoLayoutComponent {}
