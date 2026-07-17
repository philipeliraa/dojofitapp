import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';
import { Usuario } from '../models/usuario.model';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  const user: Usuario = { id: 1, nome: 'Aluno', email: 'a@dojofit.com', role: 'ALUNO' } as Usuario;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => httpMock.verify());

  it('anexa o Bearer token da memória em chamadas /api/', () => {
    authService.handleAuth({ token: 'tok-1', user });

    http.get(`${environment.apiUrl}/checkins/semana`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/checkins/semana`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer tok-1');
    req.flush({});
  });

  it('em 401 renova a sessão via refresh e refaz a requisição com o token novo', () => {
    authService.handleAuth({ token: 'tok-expirado', user });

    let resultado: unknown;
    http.get(`${environment.apiUrl}/checkins/semana`).subscribe(r => (resultado = r));

    httpMock.expectOne(`${environment.apiUrl}/checkins/semana`)
      .flush({ error: 'expirado' }, { status: 401, statusText: 'Unauthorized' });

    httpMock.expectOne(`${environment.apiUrl}/auth/refresh`).flush({ token: 'tok-novo', user });

    const retry = httpMock.expectOne(`${environment.apiUrl}/checkins/semana`);
    expect(retry.request.headers.get('Authorization')).toBe('Bearer tok-novo');
    retry.flush({ count: 2 });

    expect(resultado).toEqual({ count: 2 });
  });

  it('se o refresh também falha, derruba a sessão e propaga o erro original', () => {
    authService.handleAuth({ token: 'tok-expirado', user });

    let erro: any;
    http.get(`${environment.apiUrl}/checkins/semana`).subscribe({ error: e => (erro = e) });

    httpMock.expectOne(`${environment.apiUrl}/checkins/semana`)
      .flush({ error: 'expirado' }, { status: 401, statusText: 'Unauthorized' });
    httpMock.expectOne(`${environment.apiUrl}/auth/refresh`)
      .flush({ error: 'sessao expirada' }, { status: 401, statusText: 'Unauthorized' });

    expect(erro.status).toBe(401);
    expect(authService.isLoggedIn()).toBeFalse();
  });

  it('não tenta refresh em erro 401 de endpoint de auth (ex: login inválido)', () => {
    let erro: any;
    http.post(`${environment.apiUrl}/auth/login`, {}).subscribe({ error: e => (erro = e) });

    httpMock.expectOne(`${environment.apiUrl}/auth/login`)
      .flush({ error: 'invalido' }, { status: 401, statusText: 'Unauthorized' });

    expect(erro.status).toBe(401);
    httpMock.expectNone(`${environment.apiUrl}/auth/refresh`);
  });
});
