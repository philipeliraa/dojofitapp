import { Component, ContentChild, TemplateRef, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export interface DojofitColumnDef<T> {
  key: string;
  label: string;
  /** Formatação customizada (ex: data, valor calculado) — sem, usa row[key] direto. */
  render?: (row: T) => string;
}

export interface DojofitPagination {
  page: number;
  pageSize: number;
  total: number;
}

/**
 * Camada 3 (docs/04 seção 4): tabela densa da área de Gestão — sem cards
 * por linha, paginação numérica tradicional (docs/05 seção 8, não infinite
 * scroll). Ações por linha via <ng-template #rowActions let-row>, projetado
 * pela tela que usa a tabela.
 */
@Component({
  selector: 'dojofit-data-table',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <div class="overflow-hidden rounded-card border border-default bg-surface-base">
      <div class="overflow-x-auto">
        <table class="w-full text-body">
          <thead class="bg-surface-body">
            <tr>
              @for (col of columns(); track col.key) {
                <th class="px-4 py-3 text-left text-label text-primary">{{ col.label }}</th>
              }
              @if (rowActions) {
                <th class="px-4 py-3"></th>
              }
            </tr>
          </thead>
          <tbody class="divide-y divide-default">
            @for (row of rows(); track $index) {
              <tr>
                @for (col of columns(); track col.key) {
                  <td class="px-4 py-3 text-body text-primary">{{ cellValue(row, col) }}</td>
                }
                @if (rowActions) {
                  <td class="px-4 py-3 text-right">
                    <ng-container *ngTemplateOutlet="rowActions; context: { $implicit: row }" />
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (rows().length === 0) {
        <div class="p-8 text-center text-body text-secondary">{{ emptyStateMessage() }}</div>
      }
    </div>

    @if (pagination(); as p) {
      <div class="mt-3 flex items-center justify-between text-body text-secondary">
        <span>Página {{ p.page }} de {{ totalPages(p) }}</span>
        <div class="flex gap-2">
          <button
            class="text-brand-blue disabled:cursor-not-allowed disabled:opacity-40"
            [disabled]="p.page <= 1"
            (click)="pageChange.emit(p.page - 1)"
          >Anterior</button>
          <button
            class="text-brand-blue disabled:cursor-not-allowed disabled:opacity-40"
            [disabled]="p.page >= totalPages(p)"
            (click)="pageChange.emit(p.page + 1)"
          >Próxima</button>
        </div>
      </div>
    }
  `,
})
export class DojofitDataTableComponent<T> {
  columns = input.required<DojofitColumnDef<T>[]>();
  rows = input.required<T[]>();
  pagination = input<DojofitPagination>();
  emptyStateMessage = input('Nenhum resultado encontrado.');

  pageChange = output<number>();

  @ContentChild('rowActions') rowActions?: TemplateRef<{ $implicit: T }>;

  protected cellValue(row: T, col: DojofitColumnDef<T>): string {
    if (col.render) return col.render(row);
    const value = (row as Record<string, unknown>)[col.key];
    return value == null ? '' : String(value);
  }

  protected totalPages(p: DojofitPagination): number {
    return Math.max(1, Math.ceil(p.total / p.pageSize));
  }
}
