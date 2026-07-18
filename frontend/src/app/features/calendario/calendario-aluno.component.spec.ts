import { TestBed } from '@angular/core/testing';
import { formatDateLocal } from '../../core/utils/data.util';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CalendarioAlunoComponent } from './calendario-aluno.component';
import { PendingCheckinQueueService } from '../../offline/pending-checkin-queue.service';
import { CheckinSyncService } from '../../offline/checkin-sync.service';
import { environment } from '../../../environments/environment';
import { Aula } from '../../core/models/aula.model';

describe('CalendarioAlunoComponent', () => {
  let httpMock: HttpTestingController;
  const hoje = formatDateLocal(new Date());

  const aulaHoje: Aula = {
    id: 1, turmaId: 1, turmaNome: 'Jiu-jitsu', data: hoje, horaInicio: '19:00', horaFim: '20:00',
    capacidadeMaxima: 10, professorId: 2, professorNome: 'Prof', cancelada: false, observacao: null,
    checkinsConfirmados: 3, vagasDisponiveis: 7,
  };

  async function setup() {
    TestBed.configureTestingModule({
      imports: [CalendarioAlunoComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);

    const queue = TestBed.inject(PendingCheckinQueueService);
    queue.dbName = 'dojofit-offline-test';
    await queue.clear();
    TestBed.inject(CheckinSyncService).baseDelayMs = 0;
    await new Promise(r => setTimeout(r, 0));

    const fixture = TestBed.createComponent(CalendarioAlunoComponent);
    fixture.detectChanges();

    httpMock.expectOne(req => req.url.startsWith(`${environment.apiUrl}/aulas/semana`)).flush([aulaHoje]);
    httpMock.expectOne(`${environment.apiUrl}/checkins/historico`).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/checkins/semana`).flush({ count: 1 });
    httpMock.expectOne(`${environment.apiUrl}/checkins/streak`).flush({
      weeklyStreak: 1, averagePerWeek: 1, trainedThisWeek: true, contextualMessage: '',
    });
    fixture.detectChanges();

    return { fixture };
  }

  afterEach(() => httpMock.verify());

  it('mostra a aula de hoje com botão de check-in', async () => {
    const { fixture } = await setup();
    expect(fixture.nativeElement.textContent).toContain('Jiu-jitsu');
    expect(fixture.nativeElement.querySelector('dojofit-button')).toBeTruthy();
  });

  it('dias sem aula mostram "Sem aulas"', async () => {
    const { fixture } = await setup();
    expect(fixture.nativeElement.textContent).toContain('Sem aulas');
  });

  it('fazer check-in atualiza a semana e mostra mensagem de sucesso', async () => {
    const { fixture } = await setup();

    fixture.nativeElement.querySelector('dojofit-button button').click();
    const req = httpMock.expectOne(`${environment.apiUrl}/checkins`);
    req.flush({ id: 9, clientId: req.request.body.clientId, aulaId: 1, status: 'CONFIRMADO' });

    httpMock.expectOne(`${environment.apiUrl}/checkins/historico`).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/checkins/semana`).flush({ count: 2 });
    httpMock.expectOne(`${environment.apiUrl}/checkins/streak`).flush({
      weeklyStreak: 1, averagePerWeek: 1, trainedThisWeek: true, contextualMessage: '',
    });
    httpMock.expectOne(req => req.url.startsWith(`${environment.apiUrl}/aulas/semana`)).flush([aulaHoje]);
    await new Promise(r => setTimeout(r, 0));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Check-in realizado com sucesso');
  });
});
