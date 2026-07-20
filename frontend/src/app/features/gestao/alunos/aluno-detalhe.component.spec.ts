import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { AlunoDetalheComponent } from './aluno-detalhe.component';
import { AlunoApiService } from '../../../core/services/aluno-api.service';
import { GraduacaoApiService } from '../../../core/services/graduacao-api.service';

describe('AlunoDetalheComponent', () => {
  const modalidade = { id: 1, nome: 'Jiu-Jitsu', ativo: true };
  const faixaAzul = { id: 10, modalidadeId: 1, nome: 'Azul', cor: 'AZUL', ordem: 2, grausMax: 4 };

  function setup() {
    const alunoApi = {
      detalhe: jest.fn().mockReturnValue(of({ id: 5, nome: 'João Aluno', email: 'joao@dojofit.com', totalCheckins: 12 })),
    };
    const graduacaoApi = {
      modalidades: jest.fn().mockReturnValue(of([modalidade])),
      faixas: jest.fn().mockReturnValue(of([faixaAzul])),
      conceder: jest.fn().mockReturnValue(of({})),
      progressaoDoAluno: jest.fn().mockReturnValue(of([])),
      historicoDoAluno: jest.fn().mockReturnValue(of([])),
    };

    TestBed.configureTestingModule({
      imports: [AlunoDetalheComponent],
      providers: [
        { provide: AlunoApiService, useValue: alunoApi },
        { provide: GraduacaoApiService, useValue: graduacaoApi },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '5' }) } } },
      ],
    });
    const fixture = TestBed.createComponent(AlunoDetalheComponent);
    fixture.detectChanges();
    return { fixture, graduacaoApi };
  }

  it('mostra nome e frequência do aluno', () => {
    const { fixture } = setup();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('João Aluno');
    expect(text).toContain('12 check-in');
  });

  it('com uma única modalidade, já seleciona e carrega as faixas', () => {
    const { fixture, graduacaoApi } = setup();
    expect(graduacaoApi.faixas).toHaveBeenCalledWith(1);
    expect((fixture.componentInstance as any).modalidadeId()).toBe(1);
  });

  it('não permite conceder sem faixa selecionada', () => {
    const { fixture, graduacaoApi } = setup();
    (fixture.componentInstance as any).conceder();
    expect(graduacaoApi.conceder).not.toHaveBeenCalled();
  });

  it('concede graduação com o payload preenchido', () => {
    const { fixture, graduacaoApi } = setup();
    const comp = fixture.componentInstance as any;
    comp.onFaixa('10');
    comp.grau.set(2);
    comp.data.set('2026-07-19');
    comp.conceder();
    expect(graduacaoApi.conceder).toHaveBeenCalledWith({
      alunoId: 5,
      modalidadeId: 1,
      faixaId: 10,
      grau: 2,
      data: '2026-07-19',
      observacao: undefined,
    });
  });
});
