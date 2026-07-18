import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DojofitCheckInButtonComponent, DojofitCheckInState } from './dojofit-check-in-button.component';

@Component({
  standalone: true,
  imports: [DojofitCheckInButtonComponent],
  template: `<dojofit-check-in-button [state]="state" [loading]="loading" (action)="actionCount = actionCount + 1" />`,
})
class HostComponent {
  state: DojofitCheckInState = 'available';
  loading = false;
  actionCount = 0;
}

describe('DojofitCheckInButtonComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return { fixture };
  }

  it('available: mostra "Fazer Check-in" clicável', () => {
    const { fixture } = setup();
    expect(fixture.nativeElement.textContent).toContain('Fazer Check-in');
    fixture.nativeElement.querySelector('button').click();
    expect(fixture.componentInstance.actionCount).toBe(1);
  });

  it('checked-in: mostra confirmação em state.success e permite desfazer', () => {
    const { fixture } = setup();
    fixture.componentInstance.state = 'checked-in';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Check-in realizado!');
    fixture.nativeElement.querySelector('button').click();
    expect(fixture.componentInstance.actionCount).toBe(1);
  });

  it('blocked: mostra alerta de limite em brand.alert, sem ação clicável (docs/03 seção 7)', () => {
    const { fixture } = setup();
    fixture.componentInstance.state = 'blocked';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Limite semanal atingido');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('waitlisted: mostra aviso de lista de espera', () => {
    const { fixture } = setup();
    fixture.componentInstance.state = 'waitlisted';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('lista de espera');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('loading desabilita o clique em available', () => {
    const { fixture } = setup();
    fixture.componentInstance.loading = true;
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(fixture.componentInstance.actionCount).toBe(0);
  });
});
