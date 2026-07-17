import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DojofitButtonComponent, DojofitButtonSize, DojofitButtonVariant } from './dojofit-button.component';

@Component({
  standalone: true,
  imports: [DojofitButtonComponent],
  template: `
    <dojofit-button
      [variant]="variant"
      [size]="size"
      [disabled]="disabled"
      [loading]="loading"
      (onClick)="clicked = true"
    >Entrar</dojofit-button>
  `,
})
class HostComponent {
  variant: DojofitButtonVariant = 'primary';
  size: DojofitButtonSize = 'md';
  disabled = false;
  loading = false;
  clicked = false;
}

describe('DojofitButtonComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    return { fixture, button };
  }

  it('projeta o conteúdo como label do botão', () => {
    const { button } = setup();
    expect(button.textContent?.trim()).toContain('Entrar');
  });

  it('variant default (primary) usa brand.blue', () => {
    const { button } = setup();
    expect(button.className).toContain('bg-brand-blue');
  });

  it('variant secondary usa border.strong, sem cor de marca no fundo', () => {
    const { fixture, button } = setup();
    fixture.componentInstance.variant = 'secondary';
    fixture.detectChanges();
    expect(button.className).toContain('border-strong');
    expect(button.className).not.toContain('bg-brand-blue');
  });

  it('variant alert usa brand.alert — reservado para erro/limite (docs/03)', () => {
    const { fixture, button } = setup();
    fixture.componentInstance.variant = 'alert';
    fixture.detectChanges();
    expect(button.className).toContain('bg-brand-alert');
  });

  it('size sm usa padding menor que md', () => {
    const { fixture, button } = setup();
    fixture.componentInstance.size = 'sm';
    fixture.detectChanges();
    expect(button.className).toContain('py-2 ');
    expect(button.className).not.toContain('py-2.5');
  });

  it('disabled aplica o atributo nativo e impede o clique', () => {
    const { fixture, button } = setup();
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
    button.click();
    expect(fixture.componentInstance.clicked).toBe(false);
  });

  it('loading desabilita o clique e mostra o spinner (docs/03 seção 7)', () => {
    const { fixture, button } = setup();
    fixture.componentInstance.loading = true;
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
    expect(button.querySelector('[aria-hidden="true"]')).toBeTruthy();
    button.click();
    expect(fixture.componentInstance.clicked).toBe(false);
  });

  it('emite onClick apenas quando não disabled nem loading', () => {
    const { fixture, button } = setup();
    button.click();
    expect(fixture.componentInstance.clicked).toBe(true);
  });

  it('sempre inclui o anel de foco em brand.blue (docs/03 seção 7 — obrigatório)', () => {
    const { button } = setup();
    expect(button.className).toContain('focus-visible:ring-brand-blue');
  });
});
