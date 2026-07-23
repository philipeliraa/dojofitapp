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
import { DojofitBadgeComponent } from '../../../shared/components/base/dojofit-badge.component';
import { DojofitBeltBadgeComponent } from '../../../shared/components/composed/dojofit-belt-badge.component';
import { TecnicaApiService } from '../../../core/services/tecnica-api.service';
import { StatusTecnica, Tecnica, TecnicaAluno } from '../../../core/models/tecnica.model';
import { CampeonatoApiService, CampeonatoPayload } from '../../../core/services/campeonato-api.service';
import { Campeonato, ResultadoCampeonato, RESULTADO_INFO } from '../../../core/models/campeonato.model';
import { AvaliacaoApiService, AvaliacaoPayload } from '../../../core/services/avaliacao-api.service';
import { Avaliacao, TipoAvaliacao, TIPO_AVALIACAO_LABEL } from '../../../core/models/avaliacao.model';

/**
 * Detalhe do aluno na área de coaching (docs/06 fluxo 3): faixa atual,
 * frequência e concessão de graduação. O formulário é a própria etapa de
 * revisão — sem modal bloqueante (docs/06 passo 5). Técnicas (passo 2) são
 * Fase 3b, fora de escopo. Acessível a Professor e Admin.
 */
@Component({
  selector: 'app-aluno-detalhe',
  standalone: true,
  imports: [RouterLink, DojofitCardComponent, DojofitButtonComponent, DojofitInputComponent, DojofitBadgeComponent, DojofitBeltBadgeComponent],
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
                <dojofit-belt-badge [beltColor]="p.cor" [degree]="p.grau" [modality]="p.modalidadeNome" [showLabel]="true" size="sm" />
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
        <h3 class="mb-3 text-label text-primary">Técnicas</h3>
        @if (modalidadeId() === null) {
          <p class="text-body text-secondary">Selecione uma modalidade acima para avaliar as técnicas.</p>
        } @else if (tecnicasCatalogo().length === 0) {
          <p class="text-body text-secondary">Nenhuma técnica no catálogo desta modalidade.</p>
        } @else {
          <div class="space-y-2">
            @for (t of tecnicasCatalogo(); track t.id) {
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-default pb-2 last:border-0">
                <div class="flex items-center gap-2">
                  <span class="text-body text-primary">{{ t.nome }}</span>
                  @if (statusDe(t.id); as s) {
                    <dojofit-badge [tone]="s === 'DOMINADA' ? 'info' : 'neutral'">
                      {{ s === 'DOMINADA' ? 'Dominada' : 'Em desenvolvimento' }}
                    </dojofit-badge>
                  }
                </div>
                <div class="flex shrink-0 gap-2">
                  <button type="button" (click)="definirTecnica(t.id, 'EM_DESENVOLVIMENTO')" class="text-caption text-brand-blue hover:underline">Em desenv.</button>
                  <button type="button" (click)="definirTecnica(t.id, 'DOMINADA')" class="text-caption text-brand-blue hover:underline">Dominada</button>
                  @if (statusDe(t.id)) {
                    <button type="button" (click)="removerTecnica(t.id)" class="text-caption text-secondary hover:underline">Limpar</button>
                  }
                </div>
              </div>
            }
          </div>
        }
      </dojofit-card>

      <dojofit-card>
        <h3 class="mb-3 text-label text-primary">Histórico de graduações</h3>
        @if (historico().length > 0) {
          <div class="space-y-3">
            @for (g of historico(); track g.id) {
              <div class="border-b border-default pb-2 last:border-0">
                <div class="flex items-center gap-2">
                  <dojofit-belt-badge [beltColor]="g.cor" [degree]="g.grau" [showLabel]="true" size="sm" />
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

      <dojofit-card>
        <h3 class="mb-3 text-label text-primary">Campeonatos</h3>

        @if (campeonatos().length > 0) {
          <div class="mb-4 space-y-2">
            @for (c of campeonatos(); track c.id) {
              <div class="flex items-start justify-between gap-2 border-b border-default pb-2 last:border-0">
                <div>
                  <p class="text-body text-primary">
                    <span aria-hidden="true">{{ resultadoInfo[c.resultado].emoji }}</span> {{ c.nome }}
                  </p>
                  <p class="text-caption text-secondary">
                    {{ resultadoInfo[c.resultado].label }} · {{ formatarData(c.data) }}@if (c.categoria) { · {{ c.categoria }}}
                  </p>
                  @if (c.observacao) {
                    <p class="text-caption text-secondary">{{ c.observacao }}</p>
                  }
                </div>
                <div class="shrink-0">
                  <button type="button" (click)="editarCampeonato(c)" class="text-caption text-brand-blue hover:underline">Editar</button>
                  <button type="button" (click)="removerCampeonato(c)" class="ml-2 text-caption text-brand-alert hover:underline">Excluir</button>
                </div>
              </div>
            }
          </div>
        } @else {
          <p class="mb-4 text-body text-secondary">Nenhum campeonato registrado.</p>
        }

        <div class="border-t border-default pt-3">
          <p class="mb-2 text-label text-primary">{{ campEditandoId() ? 'Editar campeonato' : 'Novo campeonato' }}</p>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <dojofit-input label="Nome" [value]="campNome()" (valueChange)="campNome.set($event)" />
            <dojofit-input label="Data" type="date" [value]="campData()" (valueChange)="campData.set($event)" />
            <div>
              <label class="mb-1 block text-label text-primary">Resultado</label>
              <select
                [value]="campResultado()"
                (change)="campResultado.set($any($event.target).value)"
                class="w-full rounded-button border border-default bg-surface-base px-3 py-2 text-body text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
              >
                @for (r of resultados; track r) {
                  <option [value]="r">{{ resultadoInfo[r].label }}</option>
                }
              </select>
            </div>
            <dojofit-input label="Categoria (opcional)" [value]="campCategoria()" (valueChange)="campCategoria.set($event)" />
          </div>
          <div class="mt-3">
            <dojofit-input label="Observação (opcional)" [multiline]="true" [rows]="2" [value]="campObservacao()" (valueChange)="campObservacao.set($event)" />
          </div>
          @if (erroCamp()) {
            <p class="mt-2 text-caption text-brand-alert-deep">{{ erroCamp() }}</p>
          }
          <div class="mt-3 flex gap-2">
            <dojofit-button [disabled]="!campNome().trim() || !campData()" (onClick)="salvarCampeonato()">
              {{ campEditandoId() ? 'Salvar' : 'Adicionar campeonato' }}
            </dojofit-button>
            @if (campEditandoId()) {
              <dojofit-button variant="secondary" (onClick)="resetCampeonatoForm()">Cancelar</dojofit-button>
            }
          </div>
        </div>
      </dojofit-card>

      <dojofit-card>
        <h3 class="mb-3 text-label text-primary">Avaliações e recomendações</h3>

        @if (avaliacoes().length > 0) {
          <div class="mb-4 space-y-2">
            @for (a of avaliacoes(); track a.id) {
              <div class="flex items-start justify-between gap-2 border-b border-default pb-2 last:border-0">
                <div>
                  <div class="flex items-center gap-2">
                    <dojofit-badge tone="info">{{ tipoAvaliacaoLabel[a.tipo] }}</dojofit-badge>
                    <dojofit-badge>{{ a.publico ? 'Público' : 'Privado' }}</dojofit-badge>
                  </div>
                  <p class="mt-1 whitespace-pre-line text-body text-primary">{{ a.conteudo }}</p>
                  <p class="text-caption text-secondary">{{ a.autorNome }}</p>
                </div>
                <div class="shrink-0">
                  <button type="button" (click)="editarAvaliacao(a)" class="text-caption text-brand-blue hover:underline">Editar</button>
                  <button type="button" (click)="removerAvaliacao(a)" class="ml-2 text-caption text-brand-alert hover:underline">Excluir</button>
                </div>
              </div>
            }
          </div>
        } @else {
          <p class="mb-4 text-body text-secondary">Nenhuma avaliação registrada.</p>
        }

        <div class="border-t border-default pt-3">
          <p class="mb-2 text-label text-primary">{{ avEditandoId() ? 'Editar registro' : 'Novo registro' }}</p>
          <div class="mb-3">
            <label class="mb-1 block text-label text-primary">Tipo</label>
            <select
              [value]="avTipo()"
              (change)="avTipo.set($any($event.target).value)"
              class="w-full rounded-button border border-default bg-surface-base px-3 py-2 text-body text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            >
              @for (t of tiposAvaliacao; track t) {
                <option [value]="t">{{ tipoAvaliacaoLabel[t] }}</option>
              }
            </select>
          </div>
          <div class="mb-3">
            <dojofit-input label="Conteúdo" [multiline]="true" [rows]="3" [value]="avConteudo()" (valueChange)="avConteudo.set($event)" />
          </div>
          <label class="mb-3 flex items-center gap-2 text-body text-primary">
            <input type="checkbox" [checked]="avPublico()" (change)="avPublico.set($any($event.target).checked)" />
            Visível ao aluno (público)
          </label>
          @if (erroAv()) {
            <p class="mb-2 text-caption text-brand-alert-deep">{{ erroAv() }}</p>
          }
          <div class="flex gap-2">
            <dojofit-button [disabled]="!avConteudo().trim()" (onClick)="salvarAvaliacao()">
              {{ avEditandoId() ? 'Salvar' : 'Adicionar registro' }}
            </dojofit-button>
            @if (avEditandoId()) {
              <dojofit-button variant="secondary" (onClick)="resetAvaliacaoForm()">Cancelar</dojofit-button>
            }
          </div>
        </div>
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
  private readonly tecnicaApi = inject(TecnicaApiService);
  private readonly campeonatoApi = inject(CampeonatoApiService);
  private readonly avaliacaoApi = inject(AvaliacaoApiService);

  private alunoId!: number;

  protected readonly resultadoInfo = RESULTADO_INFO;
  protected readonly resultados: ResultadoCampeonato[] = ['OURO', 'PRATA', 'BRONZE', 'PARTICIPACAO'];
  protected readonly tipoAvaliacaoLabel = TIPO_AVALIACAO_LABEL;
  protected readonly tiposAvaliacao: TipoAvaliacao[] = ['AVALIACAO', 'OBSERVACAO', 'RECOMENDACAO'];

  protected readonly aluno = signal<AlunoDetalhe | null>(null);
  protected readonly progressao = signal<Progressao[]>([]);
  protected readonly historico = signal<Graduacao[]>([]);
  protected readonly modalidades = signal<Modalidade[]>([]);
  protected readonly faixas = signal<Faixa[]>([]);
  protected readonly tecnicasCatalogo = signal<Tecnica[]>([]);
  protected readonly tecnicasAluno = signal<TecnicaAluno[]>([]);
  protected readonly campeonatos = signal<Campeonato[]>([]);

  protected readonly campEditandoId = signal<number | null>(null);
  protected readonly campNome = signal('');
  protected readonly campData = signal(new Date().toISOString().slice(0, 10));
  protected readonly campResultado = signal<ResultadoCampeonato>('OURO');
  protected readonly campCategoria = signal('');
  protected readonly campObservacao = signal('');
  protected readonly erroCamp = signal('');

  protected readonly avaliacoes = signal<Avaliacao[]>([]);
  protected readonly avEditandoId = signal<number | null>(null);
  protected readonly avTipo = signal<TipoAvaliacao>('OBSERVACAO');
  protected readonly avConteudo = signal('');
  protected readonly avPublico = signal(false);
  protected readonly erroAv = signal('');

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
    this.recarregarTecnicasAluno();
    this.recarregarCampeonatos();
    this.recarregarAvaliacoes();
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
    this.tecnicasCatalogo.set([]);
    if (id !== null) {
      this.graduacaoApi.faixas(id).subscribe(f => this.faixas.set(f));
      this.tecnicaApi.listar(id).subscribe(t => this.tecnicasCatalogo.set(t));
    }
  }

  protected statusDe(tecnicaId: number): StatusTecnica | null {
    return this.tecnicasAluno().find(t => t.tecnicaId === tecnicaId)?.status ?? null;
  }

  protected definirTecnica(tecnicaId: number, status: StatusTecnica) {
    this.tecnicaApi.definirStatus(this.alunoId, tecnicaId, status)
      .subscribe(() => this.recarregarTecnicasAluno());
  }

  protected removerTecnica(tecnicaId: number) {
    this.tecnicaApi.remover(this.alunoId, tecnicaId)
      .subscribe(() => this.recarregarTecnicasAluno());
  }

  private recarregarTecnicasAluno() {
    this.tecnicaApi.doAluno(this.alunoId).subscribe(t => this.tecnicasAluno.set(t));
  }

  protected editarCampeonato(c: Campeonato) {
    this.campEditandoId.set(c.id);
    this.campNome.set(c.nome);
    this.campData.set(c.data);
    this.campResultado.set(c.resultado);
    this.campCategoria.set(c.categoria ?? '');
    this.campObservacao.set(c.observacao ?? '');
  }

  protected salvarCampeonato() {
    if (!this.campNome().trim() || !this.campData()) return;
    const payload: CampeonatoPayload = {
      nome: this.campNome().trim(),
      data: this.campData(),
      resultado: this.campResultado(),
      categoria: this.campCategoria().trim() || undefined,
      observacao: this.campObservacao().trim() || undefined,
    };
    this.erroCamp.set('');

    const req = this.campEditandoId()
      ? this.campeonatoApi.atualizar(this.alunoId, this.campEditandoId()!, payload)
      : this.campeonatoApi.registrar(this.alunoId, payload);

    req.subscribe({
      next: () => {
        this.resetCampeonatoForm();
        this.recarregarCampeonatos();
      },
      error: (err) => this.erroCamp.set(err.error?.error || 'Não foi possível salvar o campeonato.'),
    });
  }

  protected removerCampeonato(c: Campeonato) {
    this.campeonatoApi.remover(this.alunoId, c.id).subscribe({
      next: () => this.recarregarCampeonatos(),
      error: (err) => this.erroCamp.set(err.error?.error || 'Não foi possível excluir o campeonato.'),
    });
  }

  protected resetCampeonatoForm() {
    this.campEditandoId.set(null);
    this.campNome.set('');
    this.campData.set(new Date().toISOString().slice(0, 10));
    this.campResultado.set('OURO');
    this.campCategoria.set('');
    this.campObservacao.set('');
    this.erroCamp.set('');
  }

  private recarregarCampeonatos() {
    this.campeonatoApi.doAluno(this.alunoId).subscribe(c => this.campeonatos.set(c));
  }

  protected editarAvaliacao(a: Avaliacao) {
    this.avEditandoId.set(a.id);
    this.avTipo.set(a.tipo);
    this.avConteudo.set(a.conteudo);
    this.avPublico.set(a.publico);
  }

  protected salvarAvaliacao() {
    if (!this.avConteudo().trim()) return;
    const payload: AvaliacaoPayload = {
      tipo: this.avTipo(),
      conteudo: this.avConteudo().trim(),
      publico: this.avPublico(),
    };
    this.erroAv.set('');

    const req = this.avEditandoId()
      ? this.avaliacaoApi.atualizar(this.alunoId, this.avEditandoId()!, payload)
      : this.avaliacaoApi.registrar(this.alunoId, payload);

    req.subscribe({
      next: () => {
        this.resetAvaliacaoForm();
        this.recarregarAvaliacoes();
      },
      error: (err) => this.erroAv.set(err.error?.error || 'Não foi possível salvar o registro.'),
    });
  }

  protected removerAvaliacao(a: Avaliacao) {
    this.avaliacaoApi.remover(this.alunoId, a.id).subscribe({
      next: () => this.recarregarAvaliacoes(),
      error: (err) => this.erroAv.set(err.error?.error || 'Não foi possível excluir o registro.'),
    });
  }

  protected resetAvaliacaoForm() {
    this.avEditandoId.set(null);
    this.avTipo.set('OBSERVACAO');
    this.avConteudo.set('');
    this.avPublico.set(false);
    this.erroAv.set('');
  }

  private recarregarAvaliacoes() {
    this.avaliacaoApi.doAluno(this.alunoId).subscribe(a => this.avaliacoes.set(a));
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
