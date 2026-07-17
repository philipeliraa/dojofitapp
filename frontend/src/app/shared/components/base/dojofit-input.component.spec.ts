import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DojofitInputComponent, DojofitInputType } from './dojofit-input.component';

@Component({
  standalone: true,
  imports: [DojofitInputComponent],
  template: `
    <dojofit-input [label]="label" [type]="type" [error]="error" [disabled]="disabled" [(value)]="value" />
  `,
})
class HostComponent {
  label: string | undefined = 'Email';
  type: DojofitInputType = 'text';
  error: string | null = null;
  disabled = false;
  value = '';
}

describe('DojofitInputComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    return { fixture, input };
  }

  it('renderiza o label quando informado', () => {
    const { fixture } = setup();
    expect(fixture.nativeElement.querySelector('label')?.textContent?.trim()).toBe('Email');
  });

  it('não renderiza label quando ausente', () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.label = undefined;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('label')).toBeNull();
  });

  it('aplica o type informado no input nativo', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.type = 'password';
    fixture.detectChanges();
    expect(input.type).toBe('password');
  });

  it('estado de erro usa brand.alert na borda e mostra a mensagem (docs/03 seção 7)', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.error = 'Email inválido';
    fixture.detectChanges();
    expect(input.className).toContain('border-brand-alert');
    expect(fixture.nativeElement.textContent).toContain('Email inválido');
  });

  it('sem erro usa border.default', () => {
    const { input } = setup();
    expect(input.className).toContain('border-default');
  });

  it('disabled aplica o atributo nativo', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
  });

  it('digitar atualiza o value do host via two-way binding (model)', () => {
    const { fixture, input } = setup();
    input.value = 'novo@dojofit.com';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe('novo@dojofit.com');
  });
});
