import { TestBed } from '@angular/core/testing';
import { formatDateLocal } from '../../core/utils/data.util';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { InicioAlunoComponent } from './inicio-aluno.component';
import { PendingCheckinQueueService } from '../../offline/pending-checkin-queue.service';
import { CheckinSyncService } from '../../offline/checkin-sync.service';
import { environment } from '../../../environments/environment';
import { Aula } from '../../core/models/aula.model';
import { Progressao } from '../../core/models/progressao.model';

describe('InicioAlunoComponent', () => {
  let httpMock: HttpTestingController;

  const hoje = formatDateLocal(new Date());

  const aula: Aula = {
    id: 1, turmaId: 1, turmaNome: 'Jiu-jitsu', data: hoje, horaInicio: '00:00', horaFim: '23:59',
    capacidadeMaxima: 10, professorId: 2, professorNome: 'Prof', cancelada: false, observacao: null,
    checkinsConfirmados: 3, vagasDisponiveis: 7,
  };

  const progressaoAzul: Progressao = {
    modalidadeId: 1, modalidadeNome: 'Jiu-Jitsu', faixaNome: 'Azul', cor: 'AZUL', grau: 2,
    desde: '2026-01-01', grausMax: 4, checkinsNoGrau: 18, checkinsNecessarios: 40,
    proximaFaixaNome: 'Roxa', proximaFaixaCor: 'ROXA',
  };

  /** Flush das chamadas de ngOnInit, na ordem em que o componente as dispara. */
  function flushInicio(aulas: Aula[], progressao: Progressao[]) {
    httpMock.expectOne(`${environment.apiUrl}/aulas?data=${hoje}`).flush(aulas);
    httpMock.expectOne(`${environment.apiUrl}/checkins/historico`).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/checkins/semana`).flush({ count: 1, limite: 3 });
    httpMock.expectOne(`${environment.apiUrl}/checkins/streak`).flush({
      weeklyStreak: 2, averagePerWeek: 1.5, trainedThisWeek: true, contextualMessage: 'Ritmo forte',
    });
    httpMock.expectOne(`${environment.apiUrl}/eu/progressao`).flush(progressao);
    httpMock.expectOne(`${environment.apiUrl}/ranking`).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/eu/avaliacoes`).flush([]);
  }

  async function setup(progressao: Progressao[] = [], aulas: Aula[] = [aula]) {
    TestBed.configureTestingModule({
      imports: [InicioAlunoComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    httpMock = TestBed.inject(HttpTestingController);

    const queue = TestBed.inject(PendingCheckinQueueService);
    queue.dbName = 'dojofit-offline-test';
    await queue.clear();
    TestBed.inject(CheckinSyncService).baseDelayMs = 0;
    await new Promise(r => setTimeout(r, 0));

    const fixture = TestBed.createComponent(InicioAlunoComponent);
    fixture.detectChanges();

    flushInicio(aulas, progressao);
    fixture.detectChanges();

    return { fixture };
  }

  afterEach(() => httpMock.verify());

  it('mostra as estatísticas (sequência e restantes)', async () => {
    const { fixture } = await setup();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Sequência');
    expect(text).toContain('Restantes');
    expect(text).toContain('2'); // 3 (limite) - 1 (feitos) restantes
  });

  it('mostra a aula do dia com o botão de check-in', async () => {
    const { fixture } = await setup();
    expect(fixture.nativeElement.textContent).toContain('Jiu-jitsu');
    expect(fixture.nativeElement.querySelector('dojofit-check-in-button')).toBeTruthy();
  });

  it('não mostra aula que já encerrou nem o botão de check-in (docs/01)', async () => {
    const encerrada: Aula = { ...aula, id: 2, horaInicio: '00:00', horaFim: '00:00' };
    const { fixture } = await setup([], [encerrada]);
    expect(fixture.nativeElement.querySelector('dojofit-check-in-button')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Nenhuma aula hoje');
  });

  it('mostra o card de identidade com faixa/grau quando há graduação', async () => {
    const { fixture } = await setup([progressaoAzul]);
    expect(fixture.nativeElement.querySelector('dojofit-identity-card')).toBeTruthy();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Faixa Azul · Jiu-Jitsu');
    expect(text).toContain('Rumo ao 3º grau');
  });

  it('fazer check-in confirma, mostra selo feito e atualiza a progressão', async () => {
    const { fixture } = await setup([progressaoAzul]);

    fixture.nativeElement.querySelector('dojofit-check-in-button button').click();
    const req = httpMock.expectOne(`${environment.apiUrl}/checkins`);
    req.flush({ id: 9, clientId: req.request.body.clientId, aulaId: 1, status: 'CONFIRMADO' });

    // carregarResumo (CheckInService) + refreshAulas + reloadProgressao
    httpMock.expectOne(`${environment.apiUrl}/checkins/historico`).flush([
      { id: 9, aulaId: 1, aulaData: hoje, alunoId: 1, alunoNome: 'A', dataHoraCheckin: '', tipo: 'PROPRIO', status: 'CONFIRMADO', turmaNome: '', aulaHoraInicio: '' },
    ]);
    httpMock.expectOne(`${environment.apiUrl}/checkins/semana`).flush({ count: 2, limite: 3 });
    httpMock.expectOne(`${environment.apiUrl}/checkins/streak`).flush({
      weeklyStreak: 2, averagePerWeek: 1.5, trainedThisWeek: true, contextualMessage: 'Ritmo forte',
    });
    httpMock.expectOne(`${environment.apiUrl}/aulas?data=${hoje}`).flush([aula]);
    httpMock.expectOne(`${environment.apiUrl}/eu/progressao`).flush([{ ...progressaoAzul, checkinsNoGrau: 19 }]);
    await new Promise(r => setTimeout(r, 0));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Check-in feito');
    expect(fixture.nativeElement.textContent).toContain('Check-in confirmado!');
    expect(fixture.nativeElement.querySelector('dojofit-check-in-button')).toBeNull();
  });

  it('aula lotada entra em lista de espera com aviso', async () => {
    const { fixture } = await setup([progressaoAzul]);

    fixture.nativeElement.querySelector('dojofit-check-in-button button').click();
    const req = httpMock.expectOne(`${environment.apiUrl}/checkins`);
    req.flush({ id: 9, clientId: req.request.body.clientId, aulaId: 1, status: 'LISTA_ESPERA' });

    httpMock.expectOne(`${environment.apiUrl}/checkins/historico`).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/checkins/semana`).flush({ count: 1, limite: 3 });
    httpMock.expectOne(`${environment.apiUrl}/checkins/streak`).flush({
      weeklyStreak: 2, averagePerWeek: 1.5, trainedThisWeek: true, contextualMessage: 'Ritmo forte',
    });
    httpMock.expectOne(`${environment.apiUrl}/aulas?data=${hoje}`).flush([aula]);
    httpMock.expectOne(`${environment.apiUrl}/eu/progressao`).flush([progressaoAzul]);
    await new Promise(r => setTimeout(r, 0));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('lista de espera');
  });
});
