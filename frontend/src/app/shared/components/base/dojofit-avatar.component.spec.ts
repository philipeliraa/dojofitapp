import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DojofitAvatarComponent, DojofitAvatarSize } from './dojofit-avatar.component';

@Component({
  standalone: true,
  imports: [DojofitAvatarComponent],
  template: `<dojofit-avatar [initials]="initials" [size]="size" />`,
})
class HostComponent {
  initials = 'PL';
  size: DojofitAvatarSize = 'md';
}

describe('DojofitAvatarComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const avatar = fixture.nativeElement.querySelector('span') as HTMLElement;
    return { fixture, avatar };
  }

  it('mostra as iniciais recebidas', () => {
    const { avatar } = setup();
    expect(avatar.textContent?.trim()).toBe('PL');
  });

  it('usa accent.blue-soft/deep (docs/03 seção 2 — fundo de avatar)', () => {
    const { avatar } = setup();
    expect(avatar.className).toContain('bg-accent-blue-soft');
    expect(avatar.className).toContain('text-accent-blue-deep');
  });

  it('size md (default) usa dimensão maior que sm', () => {
    const { fixture, avatar } = setup();
    expect(avatar.className).toContain('size-9');
    fixture.componentInstance.size = 'sm';
    fixture.detectChanges();
    expect(avatar.className).toContain('size-7');
  });
});
