import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { AlunoDetalheComponent } from './aluno-detalhe.component';
import { AlunoApiService } from '../../../core/services/aluno-api.service';
import { GraduacaoApiService } from '../../../core/services/graduacao-api.service';
import { TecnicaApiService } from '../../../core/services/tecnica-api.service';
import { CampeonatoApiService } from '../../../core/services/campeonato-api.service';

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
    const tecnicaApi = {
      doAluno: jest.fn().mockReturnValue(of([])),
      listar: jest.fn().mockReturnValue(of([{ id: 100, modalidadeId: 1, nome: 'Armlock', descricao: null }])),
      definirStatus: jest.fn().mockReturnValue(of({})),
      remover: jest.fn().mockReturnValue(of(undefined)),
    };
    const campeonatoApi = {
      doAluno: jest.fn().mockReturnValue(of([])),
      registrar: jest.fn().mockReturnValue(of({})),
      atualizar: jest.fn().mockReturnValue(of({})),
      remover: jest.fn().mockReturnValue(of(undefined)),
    };

    TestBed.configureTestingModule({
      imports: [AlunoDetalheComponent],
      providers: [
        { provide: AlunoApiService, useValue: alunoApi },
        { provide: GraduacaoApiService, useValue: graduacaoApi },
        { provide: TecnicaApiService, useValue: tecnicaApi },
        { provide: CampeonatoApiService, useValue: campeonatoApi },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '5' }) } } },
      ],
    });
    const fixture = TestBed.createComponent(AlunoDetalheComponent);
    fixture.detectChanges();
    return { fixture, graduacaoApi, tecnicaApi, campeonatoApi };
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

  it('carrega o catálogo de técnicas da modalidade selecionada', () => {
    const { fixture, tecnicaApi } = setup();
    expect(tecnicaApi.doAluno).toHaveBeenCalledWith(5);
    expect(tecnicaApi.listar).toHaveBeenCalledWith(1);
    expect(fixture.nativeElement.textContent).toContain('Armlock');
  });

  it('definir status de técnica chama a API com o status escolhido', () => {
    const { fixture, tecnicaApi } = setup();
    (fixture.componentInstance as any).definirTecnica(100, 'DOMINADA');
    expect(tecnicaApi.definirStatus).toHaveBeenCalledWith(5, 100, 'DOMINADA');
  });

  it('carrega os campeonatos do aluno ao iniciar', () => {
    const { campeonatoApi } = setup();
    expect(campeonatoApi.doAluno).toHaveBeenCalledWith(5);
  });

  it('registrar campeonato envia o payload com nome, data e resultado', () => {
    const { fixture, campeonatoApi } = setup();
    const comp = fixture.componentInstance as any;
    comp.campNome.set('Copa SP');
    comp.campData.set('2026-05-10');
    comp.campResultado.set('OURO');
    comp.salvarCampeonato();
    expect(campeonatoApi.registrar).toHaveBeenCalledWith(5, {
      nome: 'Copa SP',
      data: '2026-05-10',
      resultado: 'OURO',
      categoria: undefined,
      observacao: undefined,
    });
  });
});
