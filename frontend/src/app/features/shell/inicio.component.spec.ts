import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { InicioComponent } from './inicio.component';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../core/models/usuario.model';

describe('InicioComponent', () => {
  function setup(role: Usuario['role']) {
    TestBed.configureTestingModule({
      imports: [InicioComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const fixture = TestBed.createComponent(InicioComponent);
    const authService = TestBed.inject(AuthService);
    authService.handleAuth({
      token: 'tok',
      user: { id: 1, nome: 'Teste', email: 'a@dojofit.com', role, ativo: true, criadoEm: '' } as Usuario,
    });
    fixture.detectChanges();
    return { fixture };
  }

  it('monta app-student-home para ALUNO', () => {
    const { fixture } = setup('ALUNO');
    expect(fixture.nativeElement.querySelector('app-student-home')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-attendance')).toBeNull();
  });

  it('monta app-attendance para PROFESSOR', () => {
    const { fixture } = setup('PROFESSOR');
    expect(fixture.nativeElement.querySelector('app-attendance')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-student-home')).toBeNull();
  });

  it('monta app-attendance para ADMIN', () => {
    const { fixture } = setup('ADMIN');
    expect(fixture.nativeElement.querySelector('app-attendance')).toBeTruthy();
  });
});
