import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AvisoApiService } from '../../core/services/aviso-api.service';
import { AuthService } from '../../core/services/auth.service';
import { Aviso } from '../../core/models/aviso.model';
import { DojofitCardComponent } from '../../shared/components/base/dojofit-card.component';
import { DojofitButtonComponent } from '../../shared/components/base/dojofit-button.component';
import { DojofitInputComponent } from '../../shared/components/base/dojofit-input.component';

/**
 * Mural (docs/02 §4, docs/09 §4 — Fase 2). Tela de consumo, visível a todos os
 * papéis. Publicação restrita a Professor/Admin. Feedback é privado: o aluno vê
 * só os próprios; a academia vê todos (o backend já entrega o feed filtrado).
 * Moderação básica: autor apaga o próprio feedback; Professor/Admin apaga
 * qualquer aviso/feedback.
 */
@Component({
  selector: 'app-mural',
  standalone: true,
  imports: [DojofitCardComponent, DojofitButtonComponent, DojofitInputComponent],
  template: `
    <div>
      <h2 class="mb-4 text-title text-primary">Mural</h2>

      @if (ehEquipe()) {
        <dojofit-card class="mb-4 block">
          <h3 class="mb-3 text-label text-primary">Publicar aviso</h3>
          <div class="mb-3">
            <dojofit-input
              label="Título"
              placeholder="Ex: Treino especial no sábado"
              [value]="novoTitulo()"
              (valueChange)="novoTitulo.set($event)"
            />
          </div>
          <div class="mb-3">
            <dojofit-input
              label="Mensagem"
              [multiline]="true"
              [rows]="3"
              placeholder="Escreva o aviso para a academia..."
              [value]="novoConteudo()"
              (valueChange)="novoConteudo.set($event)"
            />
          </div>
          @if (erroPublicacao()) {
            <p class="mb-2 text-caption text-brand-alert-deep">{{ erroPublicacao() }}</p>
          }
          <dojofit-button
            [loading]="publicando()"
            [disabled]="!podePublicar()"
            (onClick)="publicar()"
          >Publicar</dojofit-button>
        </dojofit-card>
      }

      @if (carregando()) {
        <div class="space-y-3" aria-hidden="true">
          @for (i of [1, 2, 3]; track i) {
            <dojofit-card class="block">
              <div class="mb-2 h-4 w-1/2 animate-pulse rounded-button bg-accent-blue-soft"></div>
              <div class="mb-1 h-3 w-full animate-pulse rounded-button bg-accent-blue-soft"></div>
              <div class="h-3 w-4/5 animate-pulse rounded-button bg-accent-blue-soft"></div>
            </dojofit-card>
          }
        </div>
      } @else if (avisos().length === 0) {
        <div class="py-12 text-center">
          <p class="mb-1 text-2xl" aria-hidden="true">📣</p>
          <p class="text-body text-secondary">
            {{ ehEquipe() ? 'Ainda não há avisos. Publique o primeiro acima.' : 'Tudo tranquilo por aqui. Novos avisos da academia aparecerão neste espaço.' }}
          </p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (aviso of avisos(); track aviso.id) {
            <dojofit-card class="block">
              <div class="mb-1 flex items-start justify-between gap-2">
                <h3 class="text-label text-primary">{{ aviso.titulo }}</h3>
                @if (ehEquipe()) {
                  @if (confirmandoExclusao() === aviso.id) {
                    <div class="flex shrink-0 gap-2">
                      <dojofit-button variant="alert" size="sm" (onClick)="excluirAviso(aviso.id)">Confirmar</dojofit-button>
                      <dojofit-button variant="secondary" size="sm" (onClick)="confirmandoExclusao.set(null)">Cancelar</dojofit-button>
                    </div>
                  } @else {
                    <button
                      type="button"
                      class="shrink-0 text-caption text-secondary hover:text-brand-alert-deep"
                      (click)="confirmandoExclusao.set(aviso.id)"
                    >Excluir</button>
                  }
                }
              </div>
              <p class="mb-2 text-caption text-secondary">{{ aviso.autorNome }} · {{ formatarData(aviso.criadoEm) }}</p>
              <p class="mb-3 whitespace-pre-line text-body text-primary">{{ aviso.conteudo }}</p>

              <!-- Feedback: privado. Aluno vê só os próprios; equipe vê todos (docs/02 §4) -->
              <div class="border-t border-default pt-3">
                @if (aviso.feedbacks.length > 0) {
                  <div class="mb-3 space-y-2">
                    @for (fb of aviso.feedbacks; track fb.id) {
                      <div class="flex items-start justify-between gap-2 rounded-button bg-surface-body p-2">
                        <div>
                          @if (ehEquipe()) {
                            <p class="text-caption font-medium text-primary">{{ fb.autorNome }}</p>
                          }
                          <p class="text-body text-primary">{{ fb.conteudo }}</p>
                        </div>
                        @if (podeExcluirFeedback(fb.autorId)) {
                          <button
                            type="button"
                            class="shrink-0 text-caption text-secondary hover:text-brand-alert-deep"
                            (click)="excluirFeedback(aviso.id, fb.id)"
                          >Remover</button>
                        }
                      </div>
                    }
                  </div>
                }

                <dojofit-input
                  [multiline]="true"
                  [rows]="2"
                  placeholder="Deixar um feedback para a academia..."
                  [value]="rascunho(aviso.id)"
                  (valueChange)="setRascunho(aviso.id, $event)"
                />
                <div class="mt-2">
                  <dojofit-button
                    size="sm"
                    variant="secondary"
                    [disabled]="!rascunho(aviso.id).trim()"
                    (onClick)="enviarFeedback(aviso.id)"
                  >Enviar feedback</dojofit-button>
                </div>
              </div>
            </dojofit-card>
          }
        </div>
      }

      @if (mensagem()) {
        <div
          class="fixed bottom-20 left-4 right-4 z-50 rounded-button p-3 text-center text-body font-medium"
          [class]="tipoMensagem() === 'success' ? 'bg-state-success text-white' : 'bg-brand-alert text-white'"
        >{{ mensagem() }}</div>
      }
    </div>
  `,
})
export class MuralComponent implements OnInit {
  private readonly avisoApi = inject(AvisoApiService);
  private readonly authService = inject(AuthService);

  protected readonly avisos = signal<Aviso[]>([]);
  protected readonly carregando = signal(true);
  protected readonly publicando = signal(false);
  protected readonly erroPublicacao = signal('');
  protected readonly confirmandoExclusao = signal<number | null>(null);

  protected readonly novoTitulo = signal('');
  protected readonly novoConteudo = signal('');
  private readonly rascunhos = signal<Record<number, string>>({});

  protected readonly mensagem = signal('');
  protected readonly tipoMensagem = signal<'success' | 'error'>('success');

  protected readonly ehEquipe = computed(() => {
    const role = this.authService.role();
    return role === 'PROFESSOR' || role === 'ADMIN';
  });

  protected readonly podePublicar = computed(() =>
    this.novoTitulo().trim().length > 0 && this.novoConteudo().trim().length > 0,
  );

  ngOnInit() {
    this.carregarFeed();
  }

  protected rascunho(avisoId: number): string {
    return this.rascunhos()[avisoId] ?? '';
  }

  protected setRascunho(avisoId: number, valor: string) {
    this.rascunhos.update(r => ({ ...r, [avisoId]: valor }));
  }

  protected podeExcluirFeedback(autorId: number): boolean {
    return this.ehEquipe() || this.authService.user()?.id === autorId;
  }

  protected formatarData(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  protected publicar() {
    if (!this.podePublicar()) return;
    this.publicando.set(true);
    this.erroPublicacao.set('');
    this.avisoApi.criar(this.novoTitulo().trim(), this.novoConteudo().trim()).subscribe({
      next: () => {
        this.publicando.set(false);
        this.novoTitulo.set('');
        this.novoConteudo.set('');
        this.mostrarMensagem('Aviso publicado!', 'success');
        this.carregarFeed();
      },
      error: (err) => {
        this.publicando.set(false);
        this.erroPublicacao.set(err.error?.error || 'Não foi possível publicar o aviso.');
      },
    });
  }

  protected excluirAviso(avisoId: number) {
    this.confirmandoExclusao.set(null);
    this.avisoApi.deletar(avisoId).subscribe({
      next: () => {
        this.mostrarMensagem('Aviso removido.', 'success');
        this.carregarFeed();
      },
      error: () => this.mostrarMensagem('Não foi possível remover o aviso.', 'error'),
    });
  }

  protected enviarFeedback(avisoId: number) {
    const texto = this.rascunho(avisoId).trim();
    if (!texto) return;
    this.avisoApi.adicionarFeedback(avisoId, texto).subscribe({
      next: () => {
        this.setRascunho(avisoId, '');
        this.mostrarMensagem('Feedback enviado.', 'success');
        this.carregarFeed();
      },
      error: () => this.mostrarMensagem('Não foi possível enviar o feedback.', 'error'),
    });
  }

  protected excluirFeedback(avisoId: number, feedbackId: number) {
    this.avisoApi.deletarFeedback(avisoId, feedbackId).subscribe({
      next: () => {
        this.mostrarMensagem('Feedback removido.', 'success');
        this.carregarFeed();
      },
      error: () => this.mostrarMensagem('Não foi possível remover o feedback.', 'error'),
    });
  }

  private carregarFeed() {
    this.avisoApi.listar().subscribe({
      next: (data) => {
        this.avisos.set(data);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  private mostrarMensagem(texto: string, tipo: 'success' | 'error') {
    this.mensagem.set(texto);
    this.tipoMensagem.set(tipo);
    setTimeout(() => this.mensagem.set(''), 4000);
  }
}
