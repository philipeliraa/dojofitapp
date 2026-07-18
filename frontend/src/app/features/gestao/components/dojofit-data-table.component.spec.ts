import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DojofitDataTableComponent, DojofitColumnDef, DojofitPagination } from './dojofit-data-table.component';

interface Row {
  id: number;
  nome: string;
  status: string;
}

@Component({
  standalone: true,
  imports: [DojofitDataTableComponent],
  template: `
    <dojofit-data-table
      [columns]="columns"
      [rows]="rows"
      [pagination]="pagination"
      [emptyStateMessage]="emptyStateMessage"
      (pageChange)="lastPage = $event"
    >
      <ng-template #rowActions let-row>
        <button (click)="edited = row.id">Editar</button>
      </ng-template>
    </dojofit-data-table>
  `,
})
class HostComponent {
  columns: DojofitColumnDef<Row>[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'status', label: 'Status', render: (r: Row) => r.status.toUpperCase() },
  ];
  rows: Row[] = [{ id: 1, nome: 'Aluno Um', status: 'ativo' }];
  pagination: DojofitPagination | undefined = { page: 1, pageSize: 10, total: 25 };
  emptyStateMessage = 'Nenhum resultado encontrado.';
  lastPage: number | undefined;
  edited: number | undefined;
}

describe('DojofitDataTableComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return { fixture };
  }

  it('renderiza as colunas e os valores das linhas', () => {
    const { fixture } = setup();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Nome');
    expect(text).toContain('Aluno Um');
  });

  it('usa a função render da coluna quando informada', () => {
    const { fixture } = setup();
    expect(fixture.nativeElement.textContent).toContain('ATIVO');
  });

  it('projeta as ações por linha via ng-template #rowActions', () => {
    const { fixture } = setup();
    const button = fixture.nativeElement.querySelector('tbody button');
    expect(button?.textContent).toBe('Editar');
    button.click();
    expect(fixture.componentInstance.edited).toBe(1);
  });

  it('mostra o emptyStateMessage quando rows está vazio', () => {
    const { fixture } = setup();
    fixture.componentInstance.rows = [];
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nenhum resultado encontrado.');
  });

  it('calcula o total de páginas e desabilita navegação nos limites (docs/05 seção 8 — paginação numérica)', () => {
    const { fixture } = setup();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Página 1 de 3');

    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    const anterior = buttons.find(b => b.textContent?.trim() === 'Anterior')!;
    const proxima = buttons.find(b => b.textContent?.trim() === 'Próxima')!;
    expect(anterior.disabled).toBe(true);
    expect(proxima.disabled).toBe(false);

    proxima.click();
    expect(fixture.componentInstance.lastPage).toBe(2);
  });
});
