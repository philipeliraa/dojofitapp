import { Component, input, output } from '@angular/core';
import { DojofitInputComponent } from '../../../shared/components/base/dojofit-input.component';

export interface DojofitFilterOption {
  value: string;
  label: string;
}

/**
 * Camada 3 (docs/04 seção 4): barra de filtros acima de dojofit-data-table
 * — busca por texto + filtro por dropdown (ex: Alunos por status de contrato).
 */
@Component({
  selector: 'dojofit-filter-bar',
  standalone: true,
  imports: [DojofitInputComponent],
  template: `
    <div class="mb-4 flex flex-wrap items-end gap-3">
      <div class="min-w-48 flex-1">
        <dojofit-input
          label="Buscar"
          [value]="searchValue()"
          (valueChange)="search.emit($event)"
        />
      </div>
      @if (options().length > 0) {
        <div>
          <label class="mb-1 block text-label text-primary">{{ filterLabel() }}</label>
          <select
            class="rounded-button border border-default bg-surface-base px-3 py-2 text-body text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            [value]="selectedFilter()"
            (change)="filterChange.emit($any($event.target).value)"
          >
            <option value="">Todos</option>
            @for (opt of options(); track opt.value) {
              <option [value]="opt.value">{{ opt.label }}</option>
            }
          </select>
        </div>
      }
    </div>
  `,
})
export class DojofitFilterBarComponent {
  filterLabel = input('Filtrar');
  options = input<DojofitFilterOption[]>([]);
  searchValue = input('');
  selectedFilter = input('');

  search = output<string>();
  filterChange = output<string>();
}
