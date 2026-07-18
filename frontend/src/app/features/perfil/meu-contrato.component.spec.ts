import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MeuContratoComponent } from './meu-contrato.component';
import { CheckInService } from '../checkin/checkin.service';
import { PendingCheckinQueueService } from '../../offline/pending-checkin-queue.service';
import { CheckinSyncService } from '../../offline/checkin-sync.service';
import { environment } from '../../../environments/environment';
import { Contrato } from '../../core/models/contrato.model';

describe('MeuContratoComponent', () => {
  let httpMock: HttpTestingController;

  async function setup() {
    TestBed.configureTestingModule({
      imports: [MeuContratoComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);

    const queue = TestBed.inject(PendingCheckinQueueService);
    queue.dbName = 'dojofit-offline-test';
    await queue.clear();
    TestBed.inject(CheckinSyncService).baseDelayMs = 0;
    await new Promise(r => setTimeout(r, 0));

    const fixture = TestBed.createComponent(MeuContratoComponent);
    return { fixture, checkinService: TestBed.inject(CheckInService) };
  }

  afterEach(() => httpMock.verify());

  it('mostra estado vazio quando não há contrato', async () => {
    const { fixture } = await setup();
    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiUrl}/contratos/meu`).flush([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Nenhum contrato encontrado');
  });

  it('mostra o contrato ativo e a barra de progresso usando weekInfo do CheckInService', async () => {
    const { fixture, checkinService } = await setup();
    fixture.detectChanges();

    const contrato: Contrato = {
      id: 1, alunoId: 1, alunoNome: 'Aluno', planoId: 1, planoNome: '3x semana',
      dataInicio: '2026-01-01', dataValidade: '2026-12-31', status: 'ATIVO',
    };
    httpMock.expectOne(`${environment.apiUrl}/contratos/meu`).flush([contrato]);

    // weekInfo populado por outra tela (CheckInService é singleton) — não
    // deve haver uma chamada duplicada a /checkins/semana aqui
    checkinService.carregarResumo();
    httpMock.expectOne(`${environment.apiUrl}/checkins/historico`).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/checkins/semana`).flush({ count: 2, limite: 3 });
    httpMock.expectOne(`${environment.apiUrl}/checkins/streak`).flush({ weeklyStreak: 1, averagePerWeek: 1, trainedThisWeek: true, contextualMessage: '' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('3x semana');
    expect(fixture.nativeElement.textContent).toContain('ATIVO');
    expect(fixture.nativeElement.textContent).toContain('2');
  });
});
