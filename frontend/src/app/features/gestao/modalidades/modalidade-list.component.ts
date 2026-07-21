import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ModalidadeApiService, FaixaPayload } from '../../../core/services/modalidade-api.service';
import { TecnicaApiService, TecnicaPayload } from '../../../core/services/tecnica-api.service';
import { Faixa, Modalidade } from '../../../core/models/graduacao.model';
import { Tecnica } from '../../../core/models/tecnica.model';
import { CorFaixa } from '../../../core/models/progressao.model';
import { DojofitCardComponent } from '../../../shared/components/base/dojofit-card.component';
import { DojofitButtonComponent } from '../../../shared/components/base/dojofit-button.component';
import { DojofitInputComponent } from '../../../shared/components/base/dojofit-input.component';
import { DojofitBeltBadgeComponent } from '../../../shared/components/composed/dojofit-belt-badge.component';

/**
 * Configuração de modalidades e progressão de faixas (docs/09 §5, Admin).
 * A progressão é dado — o Admin define modalidades e a sequência de faixas
 * (nome, cor, ordem, graus). Cores restritas aos 5 tokens belt.* (CorFaixa).
 */
@Component({
  selector: 'app-modalidade-list',
  standalone: true,
  imports: [DojofitCardComponent, DojofitButtonComponent, DojofitInputComponent, DojofitBeltBadgeComponent],
  template: `
    <div class="space-y-4">
      <h2 class="text-title text-primary">Modalidades</h2>

      <dojofit-card>
        <h3 class="mb-3 text-label text-primary">Nova modalidade</h3>
        <div class="flex flex-wrap items-end gap-2">
          <div class="min-w-48 flex-1">
            <dojofit-input label="Nome" placeholder="Ex: Muay Thai" [value]="novoNome()" (valueChange)="novoNome.set($event)" />
          </div>
          <dojofit-button [disabled]="!novoNome().trim()" (onClick)="criarModalidade()">Adicionar</dojofit-button>
        </div>
      </dojofit-card>

      <div class="flex flex-wrap gap-2">
        @for (m of modalidades(); track m.id) {
          <button
            type="button"
            (click)="selecionar(m.id)"
            class="rounded-button border px-3 py-1.5 text-body"
            [class]="selecionadaId() === m.id ? 'border-brand-blue bg-accent-blue-soft text-accent-blue-deep' : 'border-default text-secondary'"
          >{{ m.nome }}</button>
        }
      </div>

      @if (selecionada(); as m) {
        <dojofit-card>
          <h3 class="mb-3 text-label text-primary">Faixas de {{ m.nome }}</h3>

          @if (faixas().length > 0) {
            <div class="mb-4 space-y-2">
              @for (f of faixas(); track f.id) {
                <div class="flex items-center justify-between gap-2 border-b border-default pb-2 last:border-0">
                  <div class="flex items-center gap-2">
                    <span class="text-caption text-secondary">{{ f.ordem }}.</span>
                    <dojofit-belt-badge [beltColor]="f.cor" />
                    <span class="text-caption text-secondary">até {{ f.grausMax }} graus</span>
                  </div>
                  <div class="shrink-0">
                    <button type="button" (click)="editarFaixa(f)" class="text-caption text-brand-blue hover:underline">Editar</button>
                    <button type="button" (click)="excluirFaixa(f)" class="ml-2 text-caption text-brand-alert hover:underline">Excluir</button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <p class="mb-4 text-body text-secondary">Nenhuma faixa configurada nesta modalidade.</p>
          }

          <div class="border-t border-default pt-3">
            <p class="mb-2 text-label text-primary">{{ editandoFaixaId() ? 'Editar faixa' : 'Nova faixa' }}</p>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <dojofit-input label="Nome" [value]="faixaNome()" (valueChange)="faixaNome.set($event)" />
              <div>
                <label class="mb-1 block text-label text-primary">Cor</label>
                <select
                  [value]="faixaCor()"
                  (change)="faixaCor.set($any($event.target).value)"
                  class="w-full rounded-button border border-default bg-surface-base px-3 py-2 text-body text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                >
                  @for (c of cores; track c) {
                    <option [value]="c">{{ c }}</option>
                  }
                </select>
              </div>
              <dojofit-input label="Ordem" type="number" [value]="faixaOrdem()" (valueChange)="faixaOrdem.set($event)" />
              <dojofit-input label="Graus máximos" type="number" [value]="faixaGrausMax()" (valueChange)="faixaGrausMax.set($event)" />
            </div>
            @if (erro()) {
              <p class="mt-2 text-caption text-brand-alert-deep">{{ erro() }}</p>
            }
            <div class="mt-3 flex gap-2">
              <dojofit-button [disabled]="!faixaNome().trim()" (onClick)="salvarFaixa()">
                {{ editandoFaixaId() ? 'Salvar' : 'Adicionar faixa' }}
              </dojofit-button>
              @if (editandoFaixaId()) {
                <dojofit-button variant="secondary" (onClick)="resetFaixaForm()">Cancelar</dojofit-button>
              }
            </div>
          </div>
        </dojofit-card>

        <dojofit-card>
          <h3 class="mb-3 text-label text-primary">Catálogo de técnicas de {{ m.nome }}</h3>

          @if (tecnicas().length > 0) {
            <div class="mb-4 space-y-2">
              @for (t of tecnicas(); track t.id) {
                <div class="flex items-center justify-between gap-2 border-b border-default pb-2 last:border-0">
                  <div>
                    <p class="text-body text-primary">{{ t.nome }}</p>
                    @if (t.descricao) {
                      <p class="text-caption text-secondary">{{ t.descricao }}</p>
                    }
                  </div>
                  <div class="shrink-0">
                    <button type="button" (click)="editarTecnica(t)" class="text-caption text-brand-blue hover:underline">Editar</button>
                    <button type="button" (click)="excluirTecnica(t)" class="ml-2 text-caption text-brand-alert hover:underline">Excluir</button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <p class="mb-4 text-body text-secondary">Nenhuma técnica no catálogo desta modalidade.</p>
          }

          <div class="border-t border-default pt-3">
            <p class="mb-2 text-label text-primary">{{ editandoTecnicaId() ? 'Editar técnica' : 'Nova técnica' }}</p>
            <div class="space-y-3">
              <dojofit-input label="Nome" [value]="tecnicaNome()" (valueChange)="tecnicaNome.set($event)" />
              <dojofit-input label="Descrição (opcional)" [multiline]="true" [rows]="2" [value]="tecnicaDescricao()" (valueChange)="tecnicaDescricao.set($event)" />
            </div>
            @if (erroTecnica()) {
              <p class="mt-2 text-caption text-brand-alert-deep">{{ erroTecnica() }}</p>
            }
            <div class="mt-3 flex gap-2">
              <dojofit-button [disabled]="!tecnicaNome().trim()" (onClick)="salvarTecnica()">
                {{ editandoTecnicaId() ? 'Salvar' : 'Adicionar técnica' }}
              </dojofit-button>
              @if (editandoTecnicaId()) {
                <dojofit-button variant="secondary" (onClick)="resetTecnicaForm()">Cancelar</dojofit-button>
              }
            </div>
          </div>
        </dojofit-card>
      }
    </div>
  `,
})
export class ModalidadeListComponent implements OnInit {
  private readonly api = inject(ModalidadeApiService);
  private readonly tecnicaApi = inject(TecnicaApiService);

  protected readonly cores: CorFaixa[] = ['BRANCA', 'AZUL', 'ROXA', 'MARROM', 'PRETA'];

  protected readonly modalidades = signal<Modalidade[]>([]);
  protected readonly selecionadaId = signal<number | null>(null);
  protected readonly faixas = signal<Faixa[]>([]);
  protected readonly novoNome = signal('');
  protected readonly erro = signal('');

  protected readonly tecnicas = signal<Tecnica[]>([]);
  protected readonly editandoTecnicaId = signal<number | null>(null);
  protected readonly tecnicaNome = signal('');
  protected readonly tecnicaDescricao = signal('');
  protected readonly erroTecnica = signal('');

  protected readonly editandoFaixaId = signal<number | null>(null);
  protected readonly faixaNome = signal('');
  protected readonly faixaCor = signal<CorFaixa>('BRANCA');
  protected readonly faixaOrdem = signal('1');
  protected readonly faixaGrausMax = signal('4');

  protected readonly selecionada = computed(() =>
    this.modalidades().find(m => m.id === this.selecionadaId()) ?? null,
  );

  ngOnInit() {
    this.carregarModalidades();
  }

  protected criarModalidade() {
    const nome = this.novoNome().trim();
    if (!nome) return;
    this.api.criarModalidade(nome).subscribe(() => {
      this.novoNome.set('');
      this.carregarModalidades();
    });
  }

  protected selecionar(id: number) {
    this.selecionadaId.set(id);
    this.resetFaixaForm();
    this.resetTecnicaForm();
    this.api.faixas(id).subscribe(f => this.faixas.set(f));
    this.tecnicaApi.listar(id).subscribe(t => this.tecnicas.set(t));
  }

  protected editarFaixa(f: Faixa) {
    this.editandoFaixaId.set(f.id);
    this.faixaNome.set(f.nome);
    this.faixaCor.set(f.cor);
    this.faixaOrdem.set(String(f.ordem));
    this.faixaGrausMax.set(String(f.grausMax));
  }

  protected salvarFaixa() {
    const id = this.selecionadaId();
    if (id === null || !this.faixaNome().trim()) return;
    const payload: FaixaPayload = {
      nome: this.faixaNome().trim(),
      cor: this.faixaCor(),
      ordem: Number(this.faixaOrdem()) || 0,
      grausMax: Number(this.faixaGrausMax()) || 0,
    };
    this.erro.set('');

    const req = this.editandoFaixaId()
      ? this.api.atualizarFaixa(id, this.editandoFaixaId()!, payload)
      : this.api.criarFaixa(id, payload);

    req.subscribe({
      next: () => {
        this.resetFaixaForm();
        this.api.faixas(id).subscribe(f => this.faixas.set(f));
      },
      error: (err) => this.erro.set(err.error?.error || 'Não foi possível salvar a faixa.'),
    });
  }

  protected excluirFaixa(f: Faixa) {
    const id = this.selecionadaId();
    if (id === null) return;
    this.api.deletarFaixa(id, f.id).subscribe({
      next: () => this.api.faixas(id).subscribe(list => this.faixas.set(list)),
      error: (err) => this.erro.set(err.error?.error || 'Não foi possível excluir a faixa.'),
    });
  }

  protected resetFaixaForm() {
    this.editandoFaixaId.set(null);
    this.faixaNome.set('');
    this.faixaCor.set('BRANCA');
    this.faixaOrdem.set('1');
    this.faixaGrausMax.set('4');
    this.erro.set('');
  }

  protected editarTecnica(t: Tecnica) {
    this.editandoTecnicaId.set(t.id);
    this.tecnicaNome.set(t.nome);
    this.tecnicaDescricao.set(t.descricao ?? '');
  }

  protected salvarTecnica() {
    const modalidadeId = this.selecionadaId();
    if (modalidadeId === null || !this.tecnicaNome().trim()) return;
    const payload: TecnicaPayload = {
      nome: this.tecnicaNome().trim(),
      descricao: this.tecnicaDescricao().trim() || undefined,
    };
    this.erroTecnica.set('');

    const req = this.editandoTecnicaId()
      ? this.tecnicaApi.atualizar(modalidadeId, this.editandoTecnicaId()!, payload)
      : this.tecnicaApi.criar(modalidadeId, payload);

    req.subscribe({
      next: () => {
        this.resetTecnicaForm();
        this.tecnicaApi.listar(modalidadeId).subscribe(t => this.tecnicas.set(t));
      },
      error: (err) => this.erroTecnica.set(err.error?.error || 'Não foi possível salvar a técnica.'),
    });
  }

  protected excluirTecnica(t: Tecnica) {
    const modalidadeId = this.selecionadaId();
    if (modalidadeId === null) return;
    this.tecnicaApi.deletar(modalidadeId, t.id).subscribe({
      next: () => this.tecnicaApi.listar(modalidadeId).subscribe(list => this.tecnicas.set(list)),
      error: (err) => this.erroTecnica.set(err.error?.error || 'Não foi possível excluir a técnica.'),
    });
  }

  protected resetTecnicaForm() {
    this.editandoTecnicaId.set(null);
    this.tecnicaNome.set('');
    this.tecnicaDescricao.set('');
    this.erroTecnica.set('');
  }

  private carregarModalidades() {
    this.api.listar().subscribe(m => this.modalidades.set(m));
  }
}
