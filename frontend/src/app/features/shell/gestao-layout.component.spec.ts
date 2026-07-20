import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { GestaoLayoutComponent } from './gestao-layout.component';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../core/models/usuario.model';

describe('GestaoLayoutComponent', () => {
  function setup(role: Usuario['role']) {
    TestBed.configureTestingModule({
      imports: [GestaoLayoutComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    const authService = TestBed.inject(AuthService);
    authService.handleAuth({
      token: 'tok',
      user: { id: 1, nome: 'X', email: 'x@dojofit.com', role, ativo: true, criadoEm: '' } as Usuario,
    });
    const fixture = TestBed.createComponent(GestaoLayoutComponent);
    fixture.detectChanges();
    return Array.from(fixture.nativeElement.querySelectorAll('nav a')).map((el: any) => el.textContent.trim());
  }

  it('Admin vê todas as abas de Gestão (incluindo Alunos e Modalidades)', () => {
    expect(setup('ADMIN')).toEqual(['Alunos', 'Usuários', 'Turmas', 'Aulas', 'Planos', 'Contratos', 'Modalidades']);
  });

  it('Professor vê apenas a aba Alunos (acesso parcial, docs/02 §2)', () => {
    expect(setup('PROFESSOR')).toEqual(['Alunos']);
  });
});
