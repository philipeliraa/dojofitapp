import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CalendarioComponent } from './calendario.component';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../core/models/usuario.model';
import { provideRouter } from '@angular/router';
import { PendingCheckinQueueService } from '../../offline/pending-checkin-queue.service';
import { CheckinSyncService } from '../../offline/checkin-sync.service';

describe('CalendarioComponent', () => {
  let httpMock: HttpTestingController;

  async function setup(role: Usuario['role']) {
    TestBed.configureTestingModule({
      imports: [CalendarioComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    httpMock = TestBed.inject(HttpTestingController);

    const queue = TestBed.inject(PendingCheckinQueueService);
    queue.dbName = 'dojofit-offline-test';
    await queue.clear();
    TestBed.inject(CheckinSyncService).baseDelayMs = 0;
    await new Promise(r => setTimeout(r, 0));

    const fixture = TestBed.createComponent(CalendarioComponent);
    const authService = TestBed.inject(AuthService);
    authService.handleAuth({
      token: 'tok',
      user: { id: 1, nome: 'Teste', email: 'a@dojofit.com', role, ativo: true, criadoEm: '' } as Usuario,
    });
    fixture.detectChanges();
    httpMock.match(() => true).forEach(req => req.flush([]));
    fixture.detectChanges();
    return { fixture };
  }

  afterEach(() => httpMock.verify());

  it('monta app-calendario-aluno para ALUNO', async () => {
    const { fixture } = await setup('ALUNO');
    expect(fixture.nativeElement.querySelector('app-calendario-aluno')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-calendario-professor')).toBeNull();
  });

  it('monta app-calendario-professor para PROFESSOR/ADMIN', async () => {
    const { fixture } = await setup('PROFESSOR');
    expect(fixture.nativeElement.querySelector('app-calendario-professor')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-calendario-aluno')).toBeNull();
  });
});
