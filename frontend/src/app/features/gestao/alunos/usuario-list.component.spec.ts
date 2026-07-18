import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UsuarioListComponent } from './usuario-list.component';
import { environment } from '../../../../environments/environment';
import { Usuario } from '../../../core/models/usuario.model';

describe('UsuarioListComponent', () => {
  let httpMock: HttpTestingController;

  const usuario: Usuario = { id: 1, nome: 'Aluno Um', email: 'aluno@dojofit.com', role: 'ALUNO', ativo: true, criadoEm: '' };

  function setup() {
    TestBed.configureTestingModule({
      imports: [UsuarioListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(UsuarioListComponent);
    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiUrl}/admin/usuarios`).flush([usuario]);
    httpMock.expectOne(`${environment.apiUrl}/convites`).flush([]);
    fixture.detectChanges();
    return { fixture };
  }

  afterEach(() => httpMock.verify());

  it('mostra os usuários na tabela', () => {
    const { fixture } = setup();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Aluno Um');
    expect(text).toContain('aluno@dojofit.com');
    expect(text).toContain('Ativo');
  });

  it('excluir usuario chama o backend e recarrega', () => {
    const { fixture } = setup();
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    fixture.nativeElement.querySelector('tbody button:nth-of-type(3)').click();
    httpMock.expectOne(`${environment.apiUrl}/admin/usuarios/1`).flush(null);
    httpMock.expectOne(`${environment.apiUrl}/admin/usuarios`).flush([]);
  });

  it('abre o formulário de novo usuário e cria via dojofit-form-group + dojofit-input', () => {
    const { fixture } = setup();
    fixture.nativeElement.querySelector('dojofit-button button').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('dojofit-form-group')).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('dojofit-input').length).toBeGreaterThan(0);
  });
});
