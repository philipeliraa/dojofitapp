import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DojofitBadgeComponent, DojofitBadgeTone } from './dojofit-badge.component';

@Component({
  standalone: true,
  imports: [DojofitBadgeComponent],
  template: `<dojofit-badge [tone]="tone" [dot]="dot">{{ text }}</dojofit-badge>`,
})
class HostComponent {
  tone: DojofitBadgeTone = 'neutral';
  dot = false;
  text = '3x/semana';
}

describe('DojofitBadgeComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('span') as HTMLElement;
    return { fixture, badge };
  }

  it('projeta o conteúdo como texto do badge', () => {
    const { badge } = setup();
    expect(badge.textContent?.trim()).toContain('3x/semana');
  });

  it('tone neutral usa border.default, sem cor de marca', () => {
    const { badge } = setup();
    expect(badge.className).toContain('border-default');
  });

  it('tone info usa accent.blue-soft/deep', () => {
    const { fixture, badge } = setup();
    fixture.componentInstance.tone = 'info';
    fixture.detectChanges();
    expect(badge.className).toContain('bg-accent-blue-soft');
    expect(badge.className).toContain('text-accent-blue-deep');
  });

  it('tone alert usa brand.alert-soft/deep (docs/03 seção 7)', () => {
    const { fixture, badge } = setup();
    fixture.componentInstance.tone = 'alert';
    fixture.detectChanges();
    expect(badge.className).toContain('bg-brand-alert-soft');
    expect(badge.className).toContain('text-brand-alert-deep');
  });

  it('dot=false não renderiza o indicador circular', () => {
    const { badge } = setup();
    expect(badge.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('dot=true renderiza o indicador circular na cor do tone', () => {
    const { fixture, badge } = setup();
    fixture.componentInstance.dot = true;
    fixture.detectChanges();
    const dot = badge.querySelector('[aria-hidden="true"]');
    expect(dot).toBeTruthy();
    expect(dot?.className).toContain('bg-secondary');
  });
});
