import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HistoricoCheckinComponent } from './historico-checkin.component';
import { CheckInService } from '../checkin/checkin.service';
import { PendingCheckinQueueService } from '../../offline/pending-checkin-queue.service';
import { CheckinSyncService } from '../../offline/checkin-sync.service';
import { environment } from '../../../environments/environment';

describe('HistoricoCheckinComponent', () => {
  let httpMock: HttpTestingController;

  async function setup() {
    TestBed.configureTestingModule({
      imports: [HistoricoCheckinComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);

    const queue = TestBed.inject(PendingCheckinQueueService);
    queue.dbName = 'dojofit-offline-test';
    await queue.clear();
    TestBed.inject(CheckinSyncService).baseDelayMs = 0;
    await new Promise(r => setTimeout(r, 0));

    return { fixture: TestBed.createComponent(HistoricoCheckinComponent), checkinService: TestBed.inject(CheckInService) };
  }

  afterEach(() => httpMock.verify());

  it('mostra estado vazio quando não há histórico', async () => {
    const { fixture } = await setup();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nenhum check-in registrado');
  });

  it('mostra os check-ins do histórico carregado pelo CheckInService', async () => {
    const { fixture, checkinService } = await setup();
    fixture.detectChanges();

    checkinService.carregarResumo();
    httpMock.expectOne(`${environment.apiUrl}/checkins/historico`).flush([
      { id: 1, aulaId: 1, alunoId: 1, alunoNome: 'A', dataHoraCheckin: '', tipo: 'PROPRIO', status: 'CONFIRMADO', turmaNome: 'Jiu-jitsu', aulaData: '2026-07-10', aulaHoraInicio: '19:00' },
    ]);
    httpMock.expectOne(`${environment.apiUrl}/checkins/semana`).flush({ count: 1 });
    httpMock.expectOne(`${environment.apiUrl}/checkins/streak`).flush({ weeklyStreak: 1, averagePerWeek: 1, trainedThisWeek: true, contextualMessage: '' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Jiu-jitsu');
    expect(fixture.nativeElement.textContent).toContain('Confirmado');
  });
});
