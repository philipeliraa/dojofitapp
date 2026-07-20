import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AlunoApiService } from '../../../core/services/aluno-api.service';
import { AlunoResumo } from '../../../core/models/aluno.model';
import { DojofitCardComponent } from '../../../shared/components/base/dojofit-card.component';

/**
 * Seção Alunos (docs/02 §2): visão de coaching acessível a Professor e Admin.
 * Read-only — cada aluno leva ao detalhe com faixa/grau e concessão de
 * graduação (docs/06). A gestão de usuários (CRUD) fica na aba Usuários (Admin).
 */
@Component({
  selector: 'app-aluno-list',
  standalone: true,
  imports: [RouterLink, DojofitCardComponent],
  template: `
    <div>
      <h2 class="mb-4 text-title text-primary">Alunos</h2>

      @if (carregando()) {
        <div class="space-y-2" aria-hidden="true">
          @for (i of [1, 2, 3]; track i) {
            <dojofit-card padding="sm" class="block">
              <div class="h-4 w-1/3 animate-pulse rounded-button bg-accent-blue-soft"></div>
            </dojofit-card>
          }
        </div>
      } @else if (alunos().length === 0) {
        <p class="py-8 text-center text-body text-secondary">Nenhum aluno cadastrado ainda.</p>
      } @else {
        <div class="space-y-2">
          @for (a of alunos(); track a.id) {
            <a [routerLink]="[a.id]" class="block">
              <dojofit-card padding="sm">
                <div class="flex items-center justify-between gap-2">
                  <div>
                    <p class="text-body font-medium text-primary">{{ a.nome }}</p>
                    <p class="text-caption text-secondary">{{ a.email }}</p>
                  </div>
                  <span class="shrink-0 text-caption text-brand-blue">Ver progressão →</span>
                </div>
              </dojofit-card>
            </a>
          }
        </div>
      }
    </div>
  `,
})
export class AlunoListComponent implements OnInit {
  private readonly alunoApi = inject(AlunoApiService);

  protected readonly alunos = signal<AlunoResumo[]>([]);
  protected readonly carregando = signal(true);

  ngOnInit() {
    this.alunoApi.listar().subscribe({
      next: (data) => {
        this.alunos.set(data);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }
}
