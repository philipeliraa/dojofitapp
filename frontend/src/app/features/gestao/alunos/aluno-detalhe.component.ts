import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AlunoApiService } from '../../../core/services/aluno-api.service';
import { GraduacaoApiService } from '../../../core/services/graduacao-api.service';
import { AlunoDetalhe } from '../../../core/models/aluno.model';
import { Faixa, Graduacao, Modalidade } from '../../../core/models/graduacao.model';
import { Progressao } from '../../../core/models/progressao.model';
import { DojofitCardComponent } from '../../../shared/components/base/dojofit-card.component';
import { DojofitButtonComponent } from '../../../shared/components/base/dojofit-button.component';
import { DojofitInputComponent } from '../../../shared/components/base/dojofit-input.component';
import { DojofitBeltBadgeComponent } from '../../../shared/components/composed/dojofit-belt-badge.component';

/**
 * Detalhe do aluno na área de coaching (docs/06 fluxo 3): faixa atual,
 * frequência e concessão de graduação. O formulário é a própria etapa de
 * revisão — sem modal bloqueante (docs/06 passo 5). Técnicas (passo 2) são
 * Fase 3b, fora de escopo. Acessível a Professor e Admin.
 */
@Component({
  selector: 'app-aluno-detalhe',
  standalone: true,
  imports: [RouterLink, DojofitCardComponent, DojofitButtonComponent, DojofitInputComponent, DojofitBeltBadgeComponent],
  template: `
    <div class="space-y-4">
      <a routerLink="/gestao/alunos" class="text-caption text-brand-blue">← Alunos</a>

      @if (aluno(); as a) {
        <dojofit-card>
          <h2 class="text-title text-primary">{{ a.nome }}</h2>
          <p class="text-body text-secondary">{{ a.email }}</p>
          <p class="mt-2 text-caption text-secondary">{{ a.totalCheckins }} check-in(s) registrado(s)</p>
        </dojofit-card>
      }

      <dojofit-card>
        <h3 class="mb-3 text-label text-primary">Faixa atual</h3>
        @if (progressao().length > 0) {
          <div class="space-y-2">
            @for (p of progressao(); track p.modalidadeId) {
              <div class="flex items-center gap-2">
                <dojofit-belt-badge [beltColor]="p.cor" [degree]="p.grau" [modality]="p.modalidadeNome" />
                <span class="text-caption text-secondary">desde {{ formatarData(p.desde) }}</span>
              </div>
            }
          </div>
        } @else {
          <p class="text-body text-secondary">Ainda sem graduação registrada.</p>
        }
      </dojofit-card>

      <dojofit-card>
        <h3 class="mb-3 text-label text-primary">Conceder graduação</h3>

        <div class="mb-3">
          <label class="mb-1 block text-label text-primary">Modalidade</label>
          <select
            [value]="modalidadeId() ?? ''"
            (change)="onModalidade($any($event.target).value)"
            class="w-full rounded-button border border-default bg-surface-base px-3 py-2 text-body text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          >
            <option value="" disabled>Selecione...</option>
            @for (m of modalidades(); track m.id) {
              <option [value]="m.id">{{ m.nome }}</option>
            }
          </select>
        </div>

        <div class="mb-3">
          <label class="mb-1 block text-label text-primary">Faixa</label>
          <select
            [value]="faixaId() ?? ''"
            (change)="onFaixa($any($event.target).value)"
            [disabled]="faixas().length === 0"
            class="w-full rounded-button border border-default bg-surface-base px-3 py-2 text-body text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-blue disabled:opacity-50"
          >
            <option value="" disabled>Selecione...</option>
            @for (f of faixas(); track f.id) {
              <option [value]="f.id">{{ f.nome }}</option>
            }
          </select>
        </div>

        @if (faixaSelecionada(); as f) {
          <div class="mb-3">
            <label class="mb-1 block text-label text-primary">Grau</label>
            <select
              [value]="grau()"
              (change)="grau.set(+$any($event.target).value)"
              class="w-full rounded-button border border-default bg-surface-base px-3 py-2 text-body text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            >
              @for (g of grausDisponiveis(); track g) {
                <option [value]="g">{{ g }}º grau</option>
              }
            </select>
          </div>
        }

        <div class="mb-3">
          <dojofit-input label="Data" type="date" [value]="data()" (valueChange)="data.set($event)" />
        </div>

        <div class="mb-3">
          <dojofit-input
            label="Observação (opcional)"
            [multiline]="true"
            [rows]="2"
            placeholder="Ex: excelente evolução na guarda"
            [value]="observacao()"
            (valueChange)="observacao.set($event)"
          />
        </div>

        @if (erro()) {
          <p class="mb-2 text-caption text-brand-alert-deep">{{ erro() }}</p>
        }

        <dojofit-button [loading]="concedendo()" [disabled]="!podeConceder()" (onClick)="conceder()">
          Conceder graduação
        </dojofit-button>
      </dojofit-card>

      <dojofit-card>
        <h3 class="mb-3 text-label text-primary">Histórico de graduações</h3>
        @if (historico().length > 0) {
          <div class="space-y-3">
            @for (g of historico(); track g.id) {
              <div class="border-b border-default pb-2 last:border-0">
                <div class="flex items-center gap-2">
                  <dojofit-belt-badge [beltColor]="g.cor" [degree]="g.grau" />
                  <span class="text-caption text-secondary">{{ formatarData(g.data) }}</span>
                </div>
                @if (g.observacao) {
                  <p class="mt-1 text-body text-primary">{{ g.observacao }}</p>
                }
                <p class="mt-1 text-caption text-secondary">Concedida por {{ g.concedidaPorNome }}</p>
              </div>
            }
          </div>
        } @else {
          <p class="text-body text-secondary">Nenhuma graduação registrada ainda.</p>
        }
      </dojofit-card>

      @if (mensagem()) {
        <div class="fixed bottom-20 left-4 right-4 z-50 rounded-button bg-state-success p-3 text-center text-body font-medium text-white">
          {{ mensagem() }}
        </div>
      }
    </div>
  `,
})
export class AlunoDetalheComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly alunoApi = inject(AlunoApiService);
  private readonly graduacaoApi = inject(GraduacaoApiService);

  private alunoId!: number;

  protected readonly aluno = signal<AlunoDetalhe | null>(null);
  protected readonly progressao = signal<Progressao[]>([]);
  protected readonly historico = signal<Graduacao[]>([]);
  protected readonly modalidades = signal<Modalidade[]>([]);
  protected readonly faixas = signal<Faixa[]>([]);

  protected readonly modalidadeId = signal<number | null>(null);
  protected readonly faixaId = signal<number | null>(null);
  protected readonly grau = signal(0);
  protected readonly data = signal(new Date().toISOString().slice(0, 10));
  protected readonly observacao = signal('');

  protected readonly concedendo = signal(false);
  protected readonly erro = signal('');
  protected readonly mensagem = signal('');

  protected readonly faixaSelecionada = computed(() =>
    this.faixas().find(f => f.id === this.faixaId()) ?? null,
  );

  protected readonly grausDisponiveis = computed(() => {
    const f = this.faixaSelecionada();
    return f ? Array.from({ length: f.grausMax + 1 }, (_, i) => i) : [];
  });

  protected readonly podeConceder = computed(() =>
    this.modalidadeId() !== null && this.faixaId() !== null && this.data().length > 0,
  );

  ngOnInit() {
    this.alunoId = Number(this.route.snapshot.paramMap.get('id'));
    this.alunoApi.detalhe(this.alunoId).subscribe(a => this.aluno.set(a));
    this.recarregarProgressao();
    this.graduacaoApi.modalidades().subscribe(m => {
      this.modalidades.set(m);
      // Academia com uma única modalidade: já seleciona e carrega as faixas
      if (m.length === 1) {
        this.onModalidade(String(m[0].id));
      }
    });
  }

  protected onModalidade(valor: string) {
    const id = valor ? Number(valor) : null;
    this.modalidadeId.set(id);
    this.faixaId.set(null);
    this.faixas.set([]);
    if (id !== null) {
      this.graduacaoApi.faixas(id).subscribe(f => this.faixas.set(f));
    }
  }

  protected onFaixa(valor: string) {
    this.faixaId.set(valor ? Number(valor) : null);
    this.grau.set(0);
  }

  protected conceder() {
    if (!this.podeConceder()) return;
    this.concedendo.set(true);
    this.erro.set('');
    this.graduacaoApi.conceder({
      alunoId: this.alunoId,
      modalidadeId: this.modalidadeId()!,
      faixaId: this.faixaId()!,
      grau: this.grau(),
      data: this.data(),
      observacao: this.observacao() || undefined,
    }).subscribe({
      next: () => {
        this.concedendo.set(false);
        this.faixaId.set(null);
        this.grau.set(0);
        this.observacao.set('');
        this.mensagem.set('Graduação concedida!');
        setTimeout(() => this.mensagem.set(''), 4000);
        this.recarregarProgressao();
      },
      error: (err) => {
        this.concedendo.set(false);
        this.erro.set(err.error?.error || 'Não foi possível conceder a graduação.');
      },
    });
  }

  protected formatarData(iso: string): string {
    return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  private recarregarProgressao() {
    this.graduacaoApi.progressaoDoAluno(this.alunoId).subscribe(p => this.progressao.set(p));
    this.graduacaoApi.historicoDoAluno(this.alunoId).subscribe(h => this.historico.set(h));
  }
}
