import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AppShellComponent } from './app-shell.component';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../core/models/usuario.model';

describe('AppShellComponent', () => {
  function setup(role: Usuario['role']) {
    TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const fixture = TestBed.createComponent(AppShellComponent);
    const authService = TestBed.inject(AuthService);
    authService.handleAuth({
      token: 'tok',
      user: { id: 1, nome: 'Aluno Teste', email: 'a@dojofit.com', role, ativo: true, criadoEm: '' } as Usuario,
    });
    fixture.detectChanges();
    return { fixture };
  }

  it('mostra Início, Calendário, Mural e Perfil para todos os papéis (docs/02 — uma interface)', () => {
    const { fixture } = setup('ALUNO');
    const nav = fixture.nativeElement.querySelector('nav').textContent as string;
    expect(nav).toContain('Início');
    expect(nav).toContain('Calendário');
    expect(nav).toContain('Mural');
    expect(nav).toContain('Perfil');
  });

  it('Aluno não vê o item de navegação Gestão', () => {
    const { fixture } = setup('ALUNO');
    const nav = fixture.nativeElement.querySelector('nav').textContent as string;
    expect(nav).not.toContain('Gestão');
  });

  it('Admin vê o item de navegação Gestão', () => {
    const { fixture } = setup('ADMIN');
    const nav = fixture.nativeElement.querySelector('nav').textContent as string;
    expect(nav).toContain('Gestão');
  });

  it('Professor vê o item de navegação Gestão (acesso parcial, docs/02 §2)', () => {
    const { fixture } = setup('PROFESSOR');
    const nav = fixture.nativeElement.querySelector('nav').textContent as string;
    expect(nav).toContain('Gestão');
  });

  it('mostra as iniciais do usuário logado no avatar do header', () => {
    const { fixture } = setup('ALUNO');
    expect(fixture.nativeElement.textContent).toContain('AT');
  });
});
