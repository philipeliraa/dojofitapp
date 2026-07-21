import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RankingApiService } from './ranking-api.service';
import { environment } from '../../../environments/environment';

describe('RankingApiService', () => {
  let service: RankingApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RankingApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('busca o ranking via GET', () => {
    service.listar().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/ranking`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
