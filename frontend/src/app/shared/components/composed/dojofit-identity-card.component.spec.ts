import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { DojofitIdentityCardComponent } from './dojofit-identity-card.component';
import { Progressao } from '../../../core/models/progressao.model';

const base: Progressao = {
  modalidadeId: 1, modalidadeNome: 'Jiu-Jitsu', faixaNome: 'Azul', cor: 'AZUL',
  grau: 2, desde: '2026-01-01', grausMax: 4, checkinsNoGrau: 18, checkinsNecessarios: 40,
  proximaFaixaNome: 'Roxa', proximaFaixaCor: 'ROXA',
};

@Component({
  standalone: true,
  imports: [DojofitIdentityCardComponent],
  template: `<dojofit-identity-card [nome]="nome" [progressao]="progressao" [checkinsExtra]="extra" />`,
})
class HostComponent {
  nome = 'Philipe Lira';
  progressao: Progressao = base;
  extra = 0;
}

describe('DojofitIdentityCardComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [HostComponent], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return { fixture };
  }

  it('mostra nome, faixa e modalidade', () => {
    const { fixture } = setup();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Philipe Lira');
    expect(text).toContain('Faixa Azul · Jiu-Jitsu');
  });

  it('grau intermediário: título "Rumo ao próximo grau" e contador da meta', () => {
    const { fixture } = setup();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Rumo ao 3º grau');
    expect(text).toContain('18 de 40 check-ins');
    expect(text).toContain('Indicativo · a promoção é sempre avaliada pelo professor');
  });

  it('último grau: título "Rumo à faixa {próxima}"', () => {
    const { fixture } = setup();
    fixture.componentInstance.progressao = { ...base, grau: 4 };
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Rumo à faixa Roxa');
  });

  it('reage ao check-in do dia via checkinsExtra (otimista)', () => {
    const { fixture } = setup();
    fixture.componentInstance.extra = 1;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('19 de 40 check-ins');
  });

  it('a barra usa a cor da faixa e reflete o percentual', () => {
    const { fixture } = setup();
    // jsdom descarta var() de style.background; a cor da faixa é validada na
    // computed barColor (mapa belt.*) e o percentual no width (que jsdom mantém).
    const cmp = fixture.debugElement.query(By.directive(DojofitIdentityCardComponent)).componentInstance as unknown as { barColor(): string };
    expect(cmp.barColor()).toContain('belt-azul');
    const barra = fixture.nativeElement.querySelector('[role="progressbar"] > div') as HTMLElement;
    expect(barra.style.width).toBe('45%'); // 18/40
  });

  it('clique navega para o perfil', () => {
    const { fixture } = setup();
    const router = TestBed.inject(Router);
    const spy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    (fixture.nativeElement.querySelector('[role="button"]') as HTMLElement).click();
    expect(spy).toHaveBeenCalledWith(['/perfil']);
  });
});
