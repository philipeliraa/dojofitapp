import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService, AuthResponse } from './auth.service';
import { environment } from '../../../environments/environment';
import { Usuario } from '../models/usuario.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const user: Usuario = { id: 1, nome: 'Aluno', email: 'a@dojofit.com', role: 'ALUNO' } as Usuario;
  const authResponse: AuthResponse = { token: 'access-token-1', user };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('guarda o access token somente em memória — nunca em localStorage (docs/07)', () => {
    spyOn(localStorage, 'setItem');

    service.handleAuth(authResponse);

    expect(service.getToken()).toBe('access-token-1');
    expect(service.user()?.email).toBe('a@dojofit.com');
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('login envia withCredentials para receber o cookie httpOnly', () => {
    service.login('a@dojofit.com', 'senha').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.withCredentials).toBeTrue();
    req.flush(authResponse);
  });

  it('refreshSession$ deduplica chamadas concorrentes em uma única requisição', () => {
    service.refreshSession$().subscribe();
    service.refreshSession$().subscribe();

    const reqs = httpMock.match(`${environment.apiUrl}/auth/refresh`);
    expect(reqs.length).toBe(1);
    expect(reqs[0].request.withCredentials).toBeTrue();
    reqs[0].flush(authResponse);
    expect(service.getToken()).toBe('access-token-1');
  });

  it('restoreSession falha em silêncio quando não há cookie de sessão', async () => {
    const promise = service.restoreSession();
    httpMock.expectOne(`${environment.apiUrl}/auth/refresh`).flush(
      { error: 'Sessao expirada' }, { status: 401, statusText: 'Unauthorized' });

    await expectAsync(promise).toBeResolved();
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('cadastro envia só nome, senha e token do convite — email e papel vêm do convite (docs/06)', () => {
    service.register('Novo Aluno', 'senha-123', 'token-do-convite').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.body).toEqual({ nome: 'Novo Aluno', senha: 'senha-123', conviteToken: 'token-do-convite' });
    expect(req.request.withCredentials).toBeTrue();
    req.flush(authResponse);
  });

  it('preview do convite consulta o endpoint público com o token', () => {
    service.getConvitePreview('token-abc').subscribe();

    httpMock.expectOne(`${environment.apiUrl}/auth/convites/token-abc`).flush({ email: 'a@dojofit.com', role: 'ALUNO' });
  });

  it('logout chama o backend (limpa o cookie) e zera a sessão em memória', () => {
    service.handleAuth(authResponse);

    service.logout();
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
    expect(req.request.withCredentials).toBeTrue();
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(service.getToken()).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });
});
