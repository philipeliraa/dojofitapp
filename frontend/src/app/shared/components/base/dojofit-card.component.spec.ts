import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DojofitCardComponent, DojofitCardPadding } from './dojofit-card.component';

@Component({
  standalone: true,
  imports: [DojofitCardComponent],
  template: `<dojofit-card [padding]="padding">Conteúdo</dojofit-card>`,
})
class HostComponent {
  padding: DojofitCardPadding = 'md';
}

describe('DojofitCardComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('div') as HTMLElement;
    return { fixture, card };
  }

  it('projeta o conteúdo', () => {
    const { card } = setup();
    expect(card.textContent?.trim()).toBe('Conteúdo');
  });

  it('usa surface.base, border.default e radius.card — sem sombra (docs/03 seção 6)', () => {
    const { card } = setup();
    expect(card.className).toContain('bg-surface-base');
    expect(card.className).toContain('border-default');
    expect(card.className).toContain('rounded-card');
    expect(card.className).not.toContain('shadow');
  });

  it('padding md (default) usa p-4', () => {
    const { card } = setup();
    expect(card.className).toContain('p-4');
  });

  it('padding sm usa p-3', () => {
    const { fixture, card } = setup();
    fixture.componentInstance.padding = 'sm';
    fixture.detectChanges();
    expect(card.className).toContain('p-3');
  });
});
