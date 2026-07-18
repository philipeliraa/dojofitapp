import { TestBed } from '@angular/core/testing';
import { formatDateLocal } from '../../core/utils/data.util';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ChamadaComponent } from './chamada.component';
import { PendingCheckinQueueService } from '../../offline/pending-checkin-queue.service';
import { CheckinSyncService } from '../../offline/checkin-sync.service';
import { environment } from '../../../environments/environment';
import { Aula } from '../../core/models/aula.model';

describe('ChamadaComponent', () => {
  let httpMock: HttpTestingController;
  const hoje = formatDateLocal(new Date());

  const aula: Aula = {
    id: 1, turmaId: 1, turmaNome: 'Jiu-jitsu', data: hoje, horaInicio: '19:00', horaFim: '20:00',
    capacidadeMaxima: 10, professorId: 2, professorNome: 'Prof', cancelada: false, observacao: null,
    checkinsConfirmados: 1, vagasDisponiveis: 9,
  };

  async function setup() {
    TestBed.configureTestingModule({
      imports: [ChamadaComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);

    const queue = TestBed.inject(PendingCheckinQueueService);
    queue.dbName = 'dojofit-offline-test';
    await queue.clear();
    TestBed.inject(CheckinSyncService).baseDelayMs = 0;
    await new Promise(r => setTimeout(r, 0));

    const fixture = TestBed.createComponent(ChamadaComponent);
    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiUrl}/aulas?data=${hoje}`).flush([aula]);
    fixture.detectChanges();

    return { fixture };
  }

  afterEach(() => httpMock.verify());

  it('lista as aulas de hoje', async () => {
    const { fixture } = await setup();
    expect(fixture.nativeElement.textContent).toContain('Jiu-jitsu');
  });

  it('selecionar uma aula carrega o roster de check-ins', async () => {
    const { fixture } = await setup();

    fixture.nativeElement.querySelector('dojofit-card button').click();
    httpMock.expectOne(`${environment.apiUrl}/checkins/aula/1`).flush([
      { id: 1, aulaId: 1, alunoId: 5, alunoNome: 'Aluno Um', dataHoraCheckin: '', tipo: 'PROPRIO', status: 'CONFIRMADO', turmaNome: '', aulaData: hoje, aulaHoraInicio: '' },
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Aluno Um');
    expect(fixture.nativeElement.textContent).toContain('Confirmado');
  });

  it('check-in manual chama o backend e recarrega o roster', async () => {
    const { fixture } = await setup();

    fixture.nativeElement.querySelector('dojofit-card button').click();
    httpMock.expectOne(`${environment.apiUrl}/checkins/aula/1`).flush([]);
    fixture.detectChanges();

    fixture.componentInstance.manualAlunoId = '7';
    fixture.componentInstance.manualCheckin();

    const req = httpMock.expectOne(`${environment.apiUrl}/checkins/manual`);
    expect(req.request.body).toEqual(expect.objectContaining({ aulaId: 1, alunoId: 7 }));
    req.flush({ id: 2, aulaId: 1, status: 'CONFIRMADO' });

    httpMock.expectOne(`${environment.apiUrl}/checkins/aula/1`).flush([
      { id: 2, aulaId: 1, alunoId: 7, alunoNome: 'Novo Aluno', dataHoraCheckin: '', tipo: 'PROFESSOR', status: 'CONFIRMADO', turmaNome: '', aulaData: hoje, aulaHoraInicio: '' },
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Novo Aluno');
    expect(fixture.nativeElement.textContent).toContain('Check-in manual realizado');
  });

  it('liberar exceção da lista de espera', async () => {
    const { fixture } = await setup();

    fixture.nativeElement.querySelector('dojofit-card button').click();
    httpMock.expectOne(`${environment.apiUrl}/checkins/aula/1`).flush([
      { id: 3, aulaId: 1, alunoId: 8, alunoNome: 'Espera', dataHoraCheckin: '', tipo: 'PROPRIO', status: 'LISTA_ESPERA', turmaNome: '', aulaData: hoje, aulaHoraInicio: '' },
    ]);
    fixture.detectChanges();

    fixture.componentInstance.liberarExcecao(3);
    httpMock.expectOne(`${environment.apiUrl}/checkins/3/excecao`).flush({ id: 3, aulaId: 1, status: 'EXCECAO_LIBERADA' });
    httpMock.expectOne(`${environment.apiUrl}/checkins/aula/1`).flush([
      { id: 3, aulaId: 1, alunoId: 8, alunoNome: 'Espera', dataHoraCheckin: '', tipo: 'PROPRIO', status: 'EXCECAO_LIBERADA', turmaNome: '', aulaData: hoje, aulaHoraInicio: '' },
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Excecao liberada');
  });
});
