import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },

  // Casca única (docs/02 seção 1): uma interface para todos os papéis,
  // substitui os antigos /student, /professor, /admin separados.
  {
    path: '',
    loadComponent: () => import('./features/shell/app-shell.component').then(m => m.AppShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./features/shell/inicio.component').then(m => m.InicioComponent) },
      { path: 'calendario', loadComponent: () => import('./features/shell/calendario.component').then(m => m.CalendarioComponent) },
      { path: 'mural', loadComponent: () => import('./features/mural/mural.component').then(m => m.MuralComponent) },
      { path: 'perfil', loadComponent: () => import('./features/perfil/perfil.component').then(m => m.PerfilComponent) },
      {
        path: 'gestao',
        loadComponent: () => import('./features/shell/gestao-layout.component').then(m => m.GestaoLayoutComponent),
        canActivate: [roleGuard],
        // Professor tem acesso parcial (docs/02 seção 2: Turmas, Alunos em
        // leitura) — ainda não implementado; hoje só o Admin tem rotas aqui.
        data: { roles: ['ADMIN'] },
        children: [
          { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
          { path: 'usuarios', loadComponent: () => import('./features/gestao/alunos/usuario-list.component').then(m => m.UsuarioListComponent) },
          { path: 'turmas', loadComponent: () => import('./features/gestao/turmas/turma-list.component').then(m => m.TurmaListComponent) },
          { path: 'aulas', loadComponent: () => import('./features/gestao/turmas/aula-management.component').then(m => m.AulaManagementComponent) },
          { path: 'planos', loadComponent: () => import('./features/gestao/contratos/plano-list.component').then(m => m.PlanoListComponent) },
          { path: 'contratos', loadComponent: () => import('./features/gestao/contratos/contrato-list.component').then(m => m.ContratoListComponent) },
        ],
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
