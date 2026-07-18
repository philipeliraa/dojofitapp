import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DojofitStreakCardComponent } from './dojofit-streak-card.component';

@Component({
  standalone: true,
  imports: [DojofitStreakCardComponent],
  template: `
    <dojofit-streak-card
      [weeklyStreak]="weeklyStreak"
      [averageSessionsPerWeek]="averageSessionsPerWeek"
      [contextualMessage]="contextualMessage"
    />
  `,
})
class HostComponent {
  weeklyStreak = 3;
  averageSessionsPerWeek: number | undefined = 2;
  contextualMessage = 'Ritmo forte';
}

describe('DojofitStreakCardComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return { fixture };
  }

  it('mostra o número de semanas do streak', () => {
    const { fixture } = setup();
    expect(fixture.nativeElement.textContent).toContain('3 semanas');
  });

  it('usa singular quando streak é 1', () => {
    const { fixture } = setup();
    fixture.componentInstance.weeklyStreak = 1;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('1 semana');
    expect(fixture.nativeElement.textContent).not.toContain('1 semanas');
  });

  it('mostra a média de sessões por semana quando informada', () => {
    const { fixture } = setup();
    expect(fixture.nativeElement.textContent).toContain('média 2/semana');
  });

  it('omite a média quando não informada', () => {
    const { fixture } = setup();
    fixture.componentInstance.averageSessionsPerWeek = undefined;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('média');
  });

  it('mostra a mensagem contextual', () => {
    const { fixture } = setup();
    expect(fixture.nativeElement.textContent).toContain('Ritmo forte');
  });

  it('usa surface.base/border.default/radius.card via dojofit-card (docs/04)', () => {
    const { fixture } = setup();
    const card = fixture.nativeElement.querySelector('dojofit-card > div');
    expect(card.className).toContain('bg-surface-base');
    expect(card.className).toContain('rounded-card');
  });
});
