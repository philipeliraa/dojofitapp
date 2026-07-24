import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TurmaListComponent } from './turma-list.component';
import { environment } from '../../../../environments/environment';
import { Turma } from '../../../core/models/turma.model';

describe('TurmaListComponent', () => {
  let httpMock: HttpTestingController;

  const turma: Turma = {
    id: 1, nome: 'Jiu-jitsu', diaSemana: 'MON', horaInicio: '06:00', horaFim: '08:00',
    capacidadeMaxima: 12, professorId: 2, professorNome: 'Kleydson', ativo: true,
  };

  function setup() {
    TestBed.configureTestingModule({
      imports: [TurmaListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(TurmaListComponent);
    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiUrl}/turmas`).flush([turma]);
    httpMock.expectOne(req => req.url.startsWith(`${environment.apiUrl}/admin/usuarios`)).flush([]);
    fixture.detectChanges();
    return { fixture };
  }

  afterEach(() => httpMock.verify());

  it('mostra as turmas na tabela com o dia da semana traduzido', () => {
    const { fixture } = setup();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Jiu-jitsu');
    expect(text).toContain('Segunda');
    expect(text).toContain('06:00 - 08:00');
  });

  it('editar preenche o formulário com os dados da turma', () => {
    const { fixture } = setup();
    fixture.nativeElement.querySelector('tbody button').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.form.nome).toBe('Jiu-jitsu');
    expect(fixture.componentInstance.form.capacidadeMaximaStr).toBe('12');
  });

  it('desativar chama o toggle e recarrega', () => {
    const { fixture } = setup();
    fixture.nativeElement.querySelectorAll('tbody button')[1].click();
    httpMock.expectOne(`${environment.apiUrl}/turmas/1/toggle`).flush(null);
    httpMock.expectOne(`${environment.apiUrl}/turmas`).flush([turma]);
  });

  it('nao salva turma com hora fim menor ou igual a hora inicio', () => {
    const { fixture } = setup();
    fixture.componentInstance.form = {
      nome: 'Jiu-jitsu', diaSemana: 'MON', horaInicio: '23:00', horaFim: '00:00',
      capacidadeMaximaStr: '12', professorId: 2,
    };
    fixture.componentInstance.save();
    expect(fixture.componentInstance.errorMessage()).toContain('meia-noite');
    httpMock.expectNone(`${environment.apiUrl}/turmas`);
  });
});
