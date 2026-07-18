import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PerfilComponent } from './perfil.component';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../core/models/usuario.model';
import { PendingCheckinQueueService } from '../../offline/pending-checkin-queue.service';
import { CheckinSyncService } from '../../offline/checkin-sync.service';

describe('PerfilComponent', () => {
  let httpMock: HttpTestingController;

  async function setup(role: Usuario['role']) {
    TestBed.configureTestingModule({
      imports: [PerfilComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    httpMock = TestBed.inject(HttpTestingController);

    const queue = TestBed.inject(PendingCheckinQueueService);
    queue.dbName = 'dojofit-offline-test';
    await queue.clear();
    TestBed.inject(CheckinSyncService).baseDelayMs = 0;
    await new Promise(r => setTimeout(r, 0));

    const fixture = TestBed.createComponent(PerfilComponent);
    const authService = TestBed.inject(AuthService);
    authService.handleAuth({
      token: 'tok',
      user: { id: 1, nome: 'Aluno Teste', email: 'aluno@dojofit.com', role, ativo: true, criadoEm: '' } as Usuario,
    });
    fixture.detectChanges();
    httpMock.match(() => true).forEach(req => req.flush([]));
    fixture.detectChanges();
    return { fixture };
  }

  afterEach(() => httpMock.verify());

  it('mostra nome e email do usuário logado (dados pessoais, docs/02)', async () => {
    const { fixture } = await setup('ALUNO');
    expect(fixture.nativeElement.textContent).toContain('Aluno Teste');
    expect(fixture.nativeElement.textContent).toContain('aluno@dojofit.com');
  });

  it('Aluno vê contrato e histórico de check-in', async () => {
    const { fixture } = await setup('ALUNO');
    expect(fixture.nativeElement.querySelector('app-meu-contrato')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-historico-checkin')).toBeTruthy();
  });

  it('Professor não vê contrato nem histórico de check-in (são do Aluno)', async () => {
    const { fixture } = await setup('PROFESSOR');
    expect(fixture.nativeElement.querySelector('app-meu-contrato')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-historico-checkin')).toBeNull();
  });
});
