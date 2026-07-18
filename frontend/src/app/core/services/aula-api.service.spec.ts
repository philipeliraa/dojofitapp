import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AulaApiService } from './aula-api.service';
import { environment } from '../../../environments/environment';

describe('AulaApiService', () => {
  let service: AulaApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AulaApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('busca aulas de uma data específica', () => {
    service.getPorData('2026-07-17').subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/aulas?data=2026-07-17`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('busca aulas da semana a partir de uma data de início', () => {
    service.getSemana('2026-07-13').subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/aulas/semana?inicio=2026-07-13`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
