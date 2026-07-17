import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PerfilComponent } from './perfil.component';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../core/models/usuario.model';

describe('PerfilComponent', () => {
  function setup(role: Usuario['role']) {
    TestBed.configureTestingModule({
      imports: [PerfilComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const fixture = TestBed.createComponent(PerfilComponent);
    const authService = TestBed.inject(AuthService);
    authService.handleAuth({
      token: 'tok',
      user: { id: 1, nome: 'Aluno Teste', email: 'aluno@dojofit.com', role, ativo: true, criadoEm: '' } as Usuario,
    });
    fixture.detectChanges();
    return { fixture };
  }

  it('mostra nome e email do usuário logado (dados pessoais, docs/02)', () => {
    const { fixture } = setup('ALUNO');
    expect(fixture.nativeElement.textContent).toContain('Aluno Teste');
    expect(fixture.nativeElement.textContent).toContain('aluno@dojofit.com');
  });

  it('Aluno vê contrato e histórico de check-in', () => {
    const { fixture } = setup('ALUNO');
    expect(fixture.nativeElement.querySelector('app-my-contract')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-checkin-history')).toBeTruthy();
  });

  it('Professor não vê contrato nem histórico de check-in (são do Aluno)', () => {
    const { fixture } = setup('PROFESSOR');
    expect(fixture.nativeElement.querySelector('app-my-contract')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-checkin-history')).toBeNull();
  });
});
