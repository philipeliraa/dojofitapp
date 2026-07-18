import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ContratoListComponent } from './contrato-list.component';
import { environment } from '../../../../environments/environment';
import { Contrato } from '../../../core/models/contrato.model';

describe('ContratoListComponent', () => {
  let httpMock: HttpTestingController;

  const contrato: Contrato = {
    id: 1, alunoId: 3, alunoNome: 'Aluno Um', planoId: 1, planoNome: '3x semana',
    dataInicio: '2026-01-01', dataValidade: '2026-12-31', status: 'ATIVO',
  };

  function setup() {
    TestBed.configureTestingModule({
      imports: [ContratoListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ContratoListComponent);
    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiUrl}/contratos`).flush([contrato]);
    httpMock.expectOne(req => req.url.startsWith(`${environment.apiUrl}/admin/usuarios`)).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/planos`).flush([]);
    fixture.detectChanges();
    return { fixture };
  }

  afterEach(() => httpMock.verify());

  it('mostra os contratos na tabela', () => {
    const { fixture } = setup();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Aluno Um');
    expect(text).toContain('3x semana');
    expect(text).toContain('ATIVO');
  });

  it('editar preenche o formulário com os dados do contrato', () => {
    const { fixture } = setup();
    fixture.nativeElement.querySelector('tbody button').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.form.alunoId).toBe(3);
    expect(fixture.componentInstance.showForm()).toBe(true);
  });

  it('excluir contrato chama o backend e recarrega', () => {
    const { fixture } = setup();
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    fixture.nativeElement.querySelectorAll('tbody button')[1].click();
    httpMock.expectOne(`${environment.apiUrl}/contratos/1`).flush(null);
    httpMock.expectOne(`${environment.apiUrl}/contratos`).flush([]);
  });
});
