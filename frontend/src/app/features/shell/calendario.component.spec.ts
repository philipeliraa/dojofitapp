import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CalendarioComponent } from './calendario.component';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../core/models/usuario.model';
import { provideRouter } from '@angular/router';

describe('CalendarioComponent', () => {
  function setup(role: Usuario['role']) {
    TestBed.configureTestingModule({
      imports: [CalendarioComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const fixture = TestBed.createComponent(CalendarioComponent);
    const authService = TestBed.inject(AuthService);
    authService.handleAuth({
      token: 'tok',
      user: { id: 1, nome: 'Teste', email: 'a@dojofit.com', role, ativo: true, criadoEm: '' } as Usuario,
    });
    fixture.detectChanges();
    return { fixture };
  }

  it('monta app-student-schedule para ALUNO', () => {
    const { fixture } = setup('ALUNO');
    expect(fixture.nativeElement.querySelector('app-student-schedule')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-professor-schedule')).toBeNull();
  });

  it('monta app-professor-schedule para PROFESSOR/ADMIN', () => {
    const { fixture } = setup('PROFESSOR');
    expect(fixture.nativeElement.querySelector('app-professor-schedule')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-student-schedule')).toBeNull();
  });
});
