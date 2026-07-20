import { Component, OnInit, inject, signal } from '@angular/core';
import { NotificacaoApiService } from '../../core/services/notificacao-api.service';
import { Notificacao } from '../../core/models/notificacao.model';

/**
 * Sino de notificações no header (docs/06 passo 8). Subsistema mínimo: mostra
 * o contador de não-lidas e um painel com a lista; clicar numa notificação a
 * marca como lida. Sem push/tempo-real nesta fase.
 */
@Component({
  selector: 'app-notificacao-bell',
  standalone: true,
  template: `
    <div class="relative">
      <button
        type="button"
        (click)="alternar()"
        class="relative flex items-center text-white/80 hover:text-white"
        aria-label="Notificações"
      >
        <span class="text-lg" aria-hidden="true">🔔</span>
        @if (naoLidas() > 0) {
          <span class="absolute -right-1.5 -top-1.5 flex min-w-4 items-center justify-center rounded-full bg-brand-alert px-1 text-caption text-white">
            {{ naoLidas() }}
          </span>
        }
      </button>

      @if (aberto()) {
        <div class="absolute right-0 top-9 z-50 max-h-96 w-72 overflow-y-auto rounded-card border border-default bg-surface-base shadow-raised">
          @if (notificacoes().length === 0) {
            <p class="p-4 text-center text-body text-secondary">Nenhuma notificação.</p>
          } @else {
            @for (n of notificacoes(); track n.id) {
              <button
                type="button"
                (click)="marcarLida(n)"
                class="block w-full border-b border-default p-3 text-left last:border-0 hover:bg-surface-body"
                [class.bg-accent-blue-soft]="!n.lida"
              >
                <p class="text-label text-primary">{{ n.titulo }}</p>
                <p class="text-caption text-secondary">{{ n.mensagem }}</p>
              </button>
            }
          }
        </div>
      }
    </div>
  `,
})
export class NotificacaoBellComponent implements OnInit {
  private readonly api = inject(NotificacaoApiService);

  protected readonly notificacoes = signal<Notificacao[]>([]);
  protected readonly naoLidas = signal(0);
  protected readonly aberto = signal(false);

  ngOnInit() {
    this.api.contarNaoLidas().subscribe(r => this.naoLidas.set(r.count));
  }

  protected alternar() {
    const abrindo = !this.aberto();
    this.aberto.set(abrindo);
    if (abrindo) {
      this.api.listar().subscribe(n => this.notificacoes.set(n));
    }
  }

  protected marcarLida(n: Notificacao) {
    if (n.lida) return;
    this.api.marcarLida(n.id).subscribe(() => {
      this.notificacoes.update(lista => lista.map(x => x.id === n.id ? { ...x, lida: true } : x));
      this.naoLidas.update(c => Math.max(0, c - 1));
    });
  }
}
