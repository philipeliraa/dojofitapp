import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StreakApiService } from './streak-api.service';
import { environment } from '../../../environments/environment';

describe('StreakApiService', () => {
  let service: StreakApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StreakApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('busca o streak semanal do aluno logado', () => {
    let resultado: any;
    service.getStreak().subscribe(r => (resultado = r));

    const req = httpMock.expectOne(`${environment.apiUrl}/checkins/streak`);
    expect(req.request.method).toBe('GET');
    req.flush({ weeklyStreak: 3, averagePerWeek: 2, trainedThisWeek: true, contextualMessage: 'Ritmo forte' });

    expect(resultado.weeklyStreak).toBe(3);
  });
});
