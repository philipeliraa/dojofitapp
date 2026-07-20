import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DojofitBeltBadgeComponent } from './dojofit-belt-badge.component';
import { CorFaixa } from '../../../core/models/progressao.model';

@Component({
  standalone: true,
  imports: [DojofitBeltBadgeComponent],
  template: `<dojofit-belt-badge [beltColor]="beltColor" [degree]="degree" [modality]="modality" />`,
})
class HostComponent {
  beltColor: CorFaixa = 'AZUL';
  degree = 0;
  modality: string | undefined;
}

describe('DojofitBeltBadgeComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('span') as HTMLElement;
    return { fixture, badge };
  }

  it('mostra o nome da faixa a partir da cor', () => {
    const { fixture, badge } = setup();
    fixture.componentInstance.beltColor = 'ROXA';
    fixture.detectChanges();
    expect(badge.textContent).toContain('Roxa');
  });

  it('grau 0 não exibe grau', () => {
    const { fixture } = setup();
    expect(fixture.nativeElement.textContent).not.toContain('grau');
  });

  it('grau maior que zero é exibido', () => {
    const { fixture } = setup();
    fixture.componentInstance.degree = 3;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('3º grau');
  });

  it('exibe a modalidade quando informada', () => {
    const { fixture } = setup();
    fixture.componentInstance.modality = 'Jiu-Jitsu';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Jiu-Jitsu');
  });

  it('usa o token belt.* da cor (ex: azul)', () => {
    const { badge } = setup();
    expect(badge.className).toContain('bg-belt-azul');
    expect(badge.className).toContain('text-white');
  });

  it('faixa branca usa borda e texto escuro (docs/03 seção 3)', () => {
    const { fixture, badge } = setup();
    fixture.componentInstance.beltColor = 'BRANCA';
    fixture.detectChanges();
    expect(badge.className).toContain('bg-belt-branca');
    expect(badge.className).toContain('border-belt-branca-borda');
    expect(badge.className).toContain('text-primary');
  });
});
