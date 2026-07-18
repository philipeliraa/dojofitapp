import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AulaManagementComponent } from './aula-management.component';
import { formatDateLocal } from '../../../core/utils/data.util';
import { environment } from '../../../../environments/environment';
import { Aula } from '../../../core/models/aula.model';

describe('AulaManagementComponent', () => {
  let httpMock: HttpTestingController;
  const hoje = formatDateLocal(new Date());

  const aula: Aula = {
    id: 1, turmaId: 1, turmaNome: 'Jiu-jitsu', data: hoje, horaInicio: '19:00', horaFim: '20:00',
    capacidadeMaxima: 10, professorId: 2, professorNome: 'Prof', cancelada: false, observacao: null,
    checkinsConfirmados: 3, vagasDisponiveis: 7,
  };

  function setup() {
    TestBed.configureTestingModule({
      imports: [AulaManagementComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(AulaManagementComponent);
    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiUrl}/aulas?data=${hoje}`).flush([aula]);
    fixture.detectChanges();
    return { fixture };
  }

  afterEach(() => httpMock.verify());

  it('mostra a aula do dia via dojofit-class-card', () => {
    const { fixture } = setup();
    expect(fixture.nativeElement.querySelector('dojofit-class-card')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Jiu-jitsu');
  });

  it('cancelar aula chama o backend e recarrega', () => {
    const { fixture } = setup();
    fixture.nativeElement.querySelector('dojofit-class-card button').click();
    httpMock.expectOne(`${environment.apiUrl}/aulas/1/cancel`).flush(null);
    httpMock.expectOne(`${environment.apiUrl}/aulas?data=${hoje}`).flush([{ ...aula, cancelada: true }]);
  });

  it('gerar semana chama o backend e recarrega', () => {
    const { fixture } = setup();
    fixture.nativeElement.querySelector('dojofit-button button').click();
    httpMock.expectOne(`${environment.apiUrl}/aulas/generate`).flush(null);
    httpMock.expectOne(`${environment.apiUrl}/aulas?data=${hoje}`).flush([aula]);
  });
});
