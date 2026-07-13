import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div>
      <h2 class="text-2xl font-semibold text-brand-navy mb-6">Dashboard</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <a routerLink="/admin/planos" class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
          <h3 class="font-medium text-gray-900">Planos</h3>
          <p class="text-sm text-gray-500 mt-1">Gerenciar planos de treino</p>
        </a>
        <a routerLink="/admin/turmas" class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
          <h3 class="font-medium text-gray-900">Turmas</h3>
          <p class="text-sm text-gray-500 mt-1">Grade fixa de horarios</p>
        </a>
        <a routerLink="/admin/usuarios" class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
          <h3 class="font-medium text-gray-900">Usuarios</h3>
          <p class="text-sm text-gray-500 mt-1">Alunos e professores</p>
        </a>
        <a routerLink="/admin/contratos" class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
          <h3 class="font-medium text-gray-900">Contratos</h3>
          <p class="text-sm text-gray-500 mt-1">Vincular alunos a planos</p>
        </a>
        <a routerLink="/admin/aulas" class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
          <h3 class="font-medium text-gray-900">Aulas</h3>
          <p class="text-sm text-gray-500 mt-1">Gerenciar ocorrencias</p>
        </a>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent {}
