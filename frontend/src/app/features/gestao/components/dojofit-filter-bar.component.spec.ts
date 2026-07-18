import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DojofitFilterBarComponent, DojofitFilterOption } from './dojofit-filter-bar.component';

@Component({
  standalone: true,
  imports: [DojofitFilterBarComponent],
  template: `
    <dojofit-filter-bar
      filterLabel="Status"
      [options]="options"
      (search)="lastSearch = $event"
      (filterChange)="lastFilter = $event"
    />
  `,
})
class HostComponent {
  options: DojofitFilterOption[] = [
    { value: 'ATIVO', label: 'Ativo' },
    { value: 'EXPIRADO', label: 'Expirado' },
  ];
  lastSearch: string | undefined;
  lastFilter: string | undefined;
}

describe('DojofitFilterBarComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return { fixture };
  }

  it('emite search ao digitar no campo de busca', () => {
    const { fixture } = setup();
    const input = fixture.nativeElement.querySelector('input');
    input.value = 'Kleydson';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.componentInstance.lastSearch).toBe('Kleydson');
  });

  it('mostra as opções de filtro e emite filterChange ao selecionar', () => {
    const { fixture } = setup();
    const select = fixture.nativeElement.querySelector('select');
    expect(select.textContent).toContain('Ativo');
    expect(select.textContent).toContain('Expirado');

    select.value = 'ATIVO';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.componentInstance.lastFilter).toBe('ATIVO');
  });

  it('não mostra o dropdown de filtro quando não há opções', () => {
    const { fixture } = setup();
    fixture.componentInstance.options = [];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('select')).toBeNull();
  });
});
