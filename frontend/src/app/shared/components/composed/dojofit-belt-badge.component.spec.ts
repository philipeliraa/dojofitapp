import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DojofitBeltBadgeComponent } from './dojofit-belt-badge.component';
import { CorFaixa } from '../../../core/models/progressao.model';

@Component({
  standalone: true,
  imports: [DojofitBeltBadgeComponent],
  template: `<dojofit-belt-badge [beltColor]="beltColor" [degree]="degree" [modality]="modality" [showLabel]="showLabel" />`,
})
class HostComponent {
  beltColor: CorFaixa = 'AZUL';
  degree = 0;
  modality: string | undefined;
  showLabel = false;
}

describe('DojofitBeltBadgeComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const svg = () => fixture.nativeElement.querySelector('svg') as SVGElement;
    return { fixture, svg };
  }

  it('renderiza um SVG com aria-label da faixa', () => {
    const { fixture, svg } = setup();
    fixture.componentInstance.beltColor = 'ROXA';
    fixture.detectChanges();
    expect(svg()).toBeTruthy();
    expect(svg().getAttribute('aria-label')).toContain('Roxa');
  });

  it('usa o token belt.* da cor na tira (ex: azul)', () => {
    const { svg } = setup();
    expect(svg().outerHTML).toContain('var(--color-belt-azul)');
  });

  it('faixa branca ganha borda de contraste (docs/03 seção 3)', () => {
    const { fixture, svg } = setup();
    fixture.componentInstance.beltColor = 'BRANCA';
    fixture.detectChanges();
    expect(svg().outerHTML).toContain('var(--color-belt-branca-borda)');
  });

  it('grau 0 não mostra selo nem tarjas', () => {
    const { svg } = setup();
    expect(svg().querySelector('text')).toBeNull();
    expect(svg().querySelectorAll('rect[width="1.8"]').length).toBe(0);
  });

  it('grau desenha uma tarja por grau e o número no selo', () => {
    const { fixture, svg } = setup();
    fixture.componentInstance.degree = 3;
    fixture.detectChanges();
    expect(svg().querySelectorAll('rect[width="1.8"]').length).toBe(3);
    expect(svg().querySelector('text')?.textContent).toBe('3');
  });

  it('ponta é preta nas faixas coloridas e vermelha na preta (spec §2)', () => {
    const { fixture, svg } = setup();
    fixture.componentInstance.degree = 1;
    fixture.componentInstance.beltColor = 'AZUL';
    fixture.detectChanges();
    expect(svg().outerHTML).toContain('var(--color-belt-preta)');
    expect(svg().outerHTML).not.toContain('var(--color-belt-preta-ponta)');

    fixture.componentInstance.beltColor = 'PRETA';
    fixture.detectChanges();
    expect(svg().outerHTML).toContain('var(--color-belt-preta-ponta)');
  });

  it('sem showLabel não exibe texto; com showLabel exibe faixa/grau/modalidade', () => {
    const { fixture } = setup();
    fixture.componentInstance.degree = 2;
    fixture.componentInstance.modality = 'Jiu-Jitsu';
    fixture.detectChanges();
    // Sem rótulo, o texto visível vem só do selo (número do grau)
    expect(fixture.nativeElement.textContent).not.toContain('Jiu-Jitsu');

    fixture.componentInstance.showLabel = true;
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Azul');
    expect(text).toContain('2º grau');
    expect(text).toContain('Jiu-Jitsu');
  });
});
