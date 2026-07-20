import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AvisoApiService } from './aviso-api.service';
import { environment } from '../../../environments/environment';

describe('AvisoApiService', () => {
  let service: AvisoApiService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/avisos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AvisoApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('listar faz GET no feed de avisos', () => {
    service.listar().subscribe();
    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('criar envia título e conteúdo (sem UUID — não é escrita de fila offline)', () => {
    service.criar('Treino especial', 'Sábado às 10h').subscribe();
    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ titulo: 'Treino especial', conteudo: 'Sábado às 10h' });
    expect(req.request.body.clientId).toBeUndefined();
    req.flush({});
  });

  it('deletar aviso faz DELETE no id', () => {
    service.deletar(7).subscribe();
    const req = httpMock.expectOne(`${base}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('adicionarFeedback faz POST no aviso com o conteúdo', () => {
    service.adicionarFeedback(7, 'Vou estar lá!').subscribe();
    const req = httpMock.expectOne(`${base}/7/feedbacks`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ conteudo: 'Vou estar lá!' });
    req.flush({});
  });

  it('deletarFeedback faz DELETE no feedback do aviso', () => {
    service.deletarFeedback(7, 3).subscribe();
    const req = httpMock.expectOne(`${base}/7/feedbacks/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
