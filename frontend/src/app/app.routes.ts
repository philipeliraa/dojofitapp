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
        // Professor tem acesso parcial (docs/02 seção 2): a seção Alunos, para
        // coaching e graduação (Fase 3a). Admin tem acesso completo — as demais
        // seções restringem a ADMIN via guard próprio no filho.
        data: { roles: ['PROFESSOR', 'ADMIN'] },
        children: [
          { path: '', redirectTo: 'alunos', pathMatch: 'full' },
          // Alunos: Professor + Admin (herda o guard do pai)
          { path: 'alunos', loadComponent: () => import('./features/gestao/alunos/aluno-list.component').then(m => m.AlunoListComponent) },
          { path: 'alunos/:id', loadComponent: () => import('./features/gestao/alunos/aluno-detalhe.component').then(m => m.AlunoDetalheComponent) },
          // Demais seções: exclusivas do Admin
          { path: 'usuarios', canActivate: [roleGuard], data: { roles: ['ADMIN'] }, loadComponent: () => import('./features/gestao/alunos/usuario-list.component').then(m => m.UsuarioListComponent) },
          { path: 'turmas', canActivate: [roleGuard], data: { roles: ['ADMIN'] }, loadComponent: () => import('./features/gestao/turmas/turma-list.component').then(m => m.TurmaListComponent) },
          { path: 'aulas', canActivate: [roleGuard], data: { roles: ['ADMIN'] }, loadComponent: () => import('./features/gestao/turmas/aula-management.component').then(m => m.AulaManagementComponent) },
          { path: 'planos', canActivate: [roleGuard], data: { roles: ['ADMIN'] }, loadComponent: () => import('./features/gestao/contratos/plano-list.component').then(m => m.PlanoListComponent) },
          { path: 'contratos', canActivate: [roleGuard], data: { roles: ['ADMIN'] }, loadComponent: () => import('./features/gestao/contratos/contrato-list.component').then(m => m.ContratoListComponent) },
          { path: 'modalidades', canActivate: [roleGuard], data: { roles: ['ADMIN'] }, loadComponent: () => import('./features/gestao/modalidades/modalidade-list.component').then(m => m.ModalidadeListComponent) },
        ],
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
