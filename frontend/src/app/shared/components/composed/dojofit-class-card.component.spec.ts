import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DojofitClassCardComponent, DojofitClassCapacity } from './dojofit-class-card.component';

@Component({
  standalone: true,
  imports: [DojofitClassCardComponent],
  template: `
    <dojofit-class-card
      [className]="className"
      [time]="time"
      [professorName]="professorName"
      [capacity]="capacity"
      [cancelled]="cancelled"
    >
      <button>Ação</button>
    </dojofit-class-card>
  `,
})
class HostComponent {
  className = 'Jiu-jitsu';
  time = '19:00 - 20:00';
  professorName: string | undefined = 'Kleydson';
  capacity: DojofitClassCapacity | undefined = { current: 3, max: 10 };
  cancelled = false;
}

describe('DojofitClassCardComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return { fixture };
  }

  it('mostra nome da turma, horário e professor', () => {
    const { fixture } = setup();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Jiu-jitsu');
    expect(text).toContain('19:00 - 20:00');
    expect(text).toContain('Kleydson');
  });

  it('mostra vagas disponíveis quando há capacidade', () => {
    const { fixture } = setup();
    expect(fixture.nativeElement.textContent).toContain('7 vagas');
    expect(fixture.nativeElement.textContent).toContain('3/10');
  });

  it('mostra "Lotada" quando não há vagas', () => {
    const { fixture } = setup();
    fixture.componentInstance.capacity = { current: 10, max: 10 };
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Lotada');
  });

  it('projeta a ação (ng-content) quando a aula não está cancelada', () => {
    const { fixture } = setup();
    expect(fixture.nativeElement.querySelector('button')?.textContent).toBe('Ação');
  });

  it('aula cancelada esconde a ação e mostra o aviso', () => {
    const { fixture } = setup();
    fixture.componentInstance.cancelled = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Aula Cancelada');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});
