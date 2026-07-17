import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CheckinApiService } from './checkin-api.service';
import { environment } from '../../../environments/environment';

describe('CheckinApiService', () => {
  let service: CheckinApiService;
  let httpMock: HttpTestingController;

  const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CheckinApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('gera um clientId (UUID) em todo check-in', () => {
    service.checkin(42).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/checkins`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.aulaId).toBe(42);
    expect(req.request.body.clientId).toMatch(UUID_PATTERN);
    req.flush({});
  });

  it('reenvio com o mesmo clientId preserva o UUID original (idempotência)', () => {
    const clientId = crypto.randomUUID();

    service.checkin(42, clientId).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/checkins`);
    expect(req.request.body.clientId).toBe(clientId);
    req.flush({});
  });

  it('check-ins distintos geram UUIDs distintos', () => {
    service.checkin(1).subscribe();
    service.checkin(1).subscribe();

    const reqs = httpMock.match(`${environment.apiUrl}/checkins`);
    expect(reqs.length).toBe(2);
    expect(reqs[0].request.body.clientId).not.toBe(reqs[1].request.body.clientId);
    reqs.forEach(r => r.flush({}));
  });

  it('check-in manual envia aulaId, alunoId e clientId', () => {
    service.manualCheckin(42, 7).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/checkins/manual`);
    expect(req.request.body.aulaId).toBe(42);
    expect(req.request.body.alunoId).toBe(7);
    expect(req.request.body.clientId).toMatch(UUID_PATTERN);
    req.flush({});
  });
});
