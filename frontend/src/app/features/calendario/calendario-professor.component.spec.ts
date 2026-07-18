import { TestBed } from '@angular/core/testing';
import { formatDateLocal } from '../../core/utils/data.util';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CalendarioProfessorComponent } from './calendario-professor.component';
import { PendingCheckinQueueService } from '../../offline/pending-checkin-queue.service';
import { CheckinSyncService } from '../../offline/checkin-sync.service';
import { environment } from '../../../environments/environment';
import { Aula } from '../../core/models/aula.model';

describe('CalendarioProfessorComponent', () => {
  let httpMock: HttpTestingController;
  const hoje = formatDateLocal(new Date());

  const aulaHoje: Aula = {
    id: 1, turmaId: 1, turmaNome: 'Jiu-jitsu', data: hoje, horaInicio: '19:00', horaFim: '20:00',
    capacidadeMaxima: 10, professorId: 2, professorNome: 'Prof', cancelada: false, observacao: null,
    checkinsConfirmados: 1, vagasDisponiveis: 9,
  };

  async function setup() {
    TestBed.configureTestingModule({
      imports: [CalendarioProfessorComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);

    const queue = TestBed.inject(PendingCheckinQueueService);
    queue.dbName = 'dojofit-offline-test';
    await queue.clear();
    TestBed.inject(CheckinSyncService).baseDelayMs = 0;
    await new Promise(r => setTimeout(r, 0));

    const fixture = TestBed.createComponent(CalendarioProfessorComponent);
    fixture.detectChanges();
    httpMock.expectOne(req => req.url.startsWith(`${environment.apiUrl}/aulas/semana`)).flush([aulaHoje]);
    fixture.detectChanges();

    return { fixture };
  }

  afterEach(() => httpMock.verify());

  it('mostra a grade semanal', async () => {
    const { fixture } = await setup();
    expect(fixture.nativeElement.textContent).toContain('Jiu-jitsu');
  });

  it('clicar na aula de hoje abre o painel de override manual e carrega o roster', async () => {
    const { fixture } = await setup();

    fixture.nativeElement.querySelector('dojofit-card button').click();
    httpMock.expectOne(`${environment.apiUrl}/checkins/aula/1`).flush([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('dojofit-input')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Nenhum check-in');
  });

  it('check-in manual dentro do Calendário funciona (docs/02 — override manual do professor)', async () => {
    const { fixture } = await setup();

    fixture.nativeElement.querySelector('dojofit-card button').click();
    httpMock.expectOne(`${environment.apiUrl}/checkins/aula/1`).flush([]);
    fixture.detectChanges();

    fixture.componentInstance.manualAlunoId = '9';
    fixture.componentInstance.manualCheckin();

    const req = httpMock.expectOne(`${environment.apiUrl}/checkins/manual`);
    expect(req.request.body).toEqual(expect.objectContaining({ aulaId: 1, alunoId: 9 }));
    req.flush({ id: 4, aulaId: 1, status: 'CONFIRMADO' });

    httpMock.expectOne(`${environment.apiUrl}/checkins/aula/1`).flush([
      { id: 4, aulaId: 1, alunoId: 9, alunoNome: 'Aluno Nove', dataHoraCheckin: '', tipo: 'PROFESSOR', status: 'CONFIRMADO', turmaNome: '', aulaData: hoje, aulaHoraInicio: '' },
    ]);
    httpMock.expectOne(req => req.url.startsWith(`${environment.apiUrl}/aulas/semana`)).flush([aulaHoje]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Aluno Nove');
    expect(fixture.nativeElement.textContent).toContain('Check-in manual realizado');
  });
});
