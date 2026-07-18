import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { InicioComponent } from './inicio.component';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../core/models/usuario.model';
import { PendingCheckinQueueService } from '../../offline/pending-checkin-queue.service';
import { CheckinSyncService } from '../../offline/checkin-sync.service';

describe('InicioComponent', () => {
  let httpMock: HttpTestingController;

  async function setup(role: Usuario['role']) {
    TestBed.configureTestingModule({
      imports: [InicioComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    httpMock = TestBed.inject(HttpTestingController);

    const queue = TestBed.inject(PendingCheckinQueueService);
    queue.dbName = 'dojofit-offline-test';
    await queue.clear();
    TestBed.inject(CheckinSyncService).baseDelayMs = 0;
    await new Promise(r => setTimeout(r, 0));

    const fixture = TestBed.createComponent(InicioComponent);
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

  it('monta app-inicio-aluno para ALUNO', async () => {
    const { fixture } = await setup('ALUNO');
    expect(fixture.nativeElement.querySelector('app-inicio-aluno')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-chamada')).toBeNull();
  });

  it('monta app-chamada para PROFESSOR', async () => {
    const { fixture } = await setup('PROFESSOR');
    expect(fixture.nativeElement.querySelector('app-chamada')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-inicio-aluno')).toBeNull();
  });

  it('monta app-chamada para ADMIN', async () => {
    const { fixture } = await setup('ADMIN');
    expect(fixture.nativeElement.querySelector('app-chamada')).toBeTruthy();
  });
});
