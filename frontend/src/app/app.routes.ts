import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },

  {
    path: 'student',
    loadComponent: () => import('./features/student/student-layout.component').then(m => m.StudentLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ALUNO'] },
    children: [
      { path: '', loadComponent: () => import('./features/student/home/student-home.component').then(m => m.StudentHomeComponent) },
      { path: 'schedule', loadComponent: () => import('./features/student/schedule/student-schedule.component').then(m => m.StudentScheduleComponent) },
      { path: 'history', loadComponent: () => import('./features/student/history/checkin-history.component').then(m => m.CheckinHistoryComponent) },
      { path: 'contract', loadComponent: () => import('./features/student/contract/my-contract.component').then(m => m.MyContractComponent) },
    ],
  },

  {
    path: 'professor',
    loadComponent: () => import('./features/professor/professor-layout.component').then(m => m.ProfessorLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PROFESSOR', 'ADMIN'] },
    children: [
      { path: '', loadComponent: () => import('./features/professor/attendance/attendance.component').then(m => m.AttendanceComponent) },
      { path: 'schedule', loadComponent: () => import('./features/professor/schedule/professor-schedule.component').then(m => m.ProfessorScheduleComponent) },
    ],
  },

  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'planos', loadComponent: () => import('./features/admin/planos/plano-list.component').then(m => m.PlanoListComponent) },
      { path: 'turmas', loadComponent: () => import('./features/admin/turmas/turma-list.component').then(m => m.TurmaListComponent) },
      { path: 'usuarios', loadComponent: () => import('./features/admin/usuarios/usuario-list.component').then(m => m.UsuarioListComponent) },
      { path: 'contratos', loadComponent: () => import('./features/admin/contratos/contrato-list.component').then(m => m.ContratoListComponent) },
      { path: 'aulas', loadComponent: () => import('./features/admin/aulas/aula-management.component').then(m => m.AulaManagementComponent) },
    ],
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
