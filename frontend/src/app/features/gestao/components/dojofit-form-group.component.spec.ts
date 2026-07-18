import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DojofitFormGroupComponent } from './dojofit-form-group.component';

@Component({
  standalone: true,
  imports: [DojofitFormGroupComponent],
  template: `
    <dojofit-form-group [label]="label">
      <input type="text" />
    </dojofit-form-group>
  `,
})
class HostComponent {
  label: string | undefined = 'Dados do aluno';
}

describe('DojofitFormGroupComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return { fixture };
  }

  it('mostra o label de seção quando informado', () => {
    const { fixture } = setup();
    expect(fixture.nativeElement.querySelector('h3')?.textContent).toBe('Dados do aluno');
  });

  it('não mostra label quando ausente', () => {
    const { fixture } = setup();
    fixture.componentInstance.label = undefined;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h3')).toBeNull();
  });

  it('projeta os campos do formulário', () => {
    const { fixture } = setup();
    expect(fixture.nativeElement.querySelector('input')).toBeTruthy();
  });
});
