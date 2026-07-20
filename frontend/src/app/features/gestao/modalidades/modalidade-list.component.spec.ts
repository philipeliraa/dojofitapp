import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ModalidadeListComponent } from './modalidade-list.component';
import { ModalidadeApiService } from '../../../core/services/modalidade-api.service';

describe('ModalidadeListComponent', () => {
  const modalidade = { id: 1, nome: 'Jiu-Jitsu', ativo: true };
  const faixa = { id: 10, modalidadeId: 1, nome: 'Azul', cor: 'AZUL' as const, ordem: 2, grausMax: 4 };

  function setup() {
    const api = {
      listar: jest.fn().mockReturnValue(of([modalidade])),
      faixas: jest.fn().mockReturnValue(of([faixa])),
      criarModalidade: jest.fn().mockReturnValue(of(modalidade)),
      atualizarModalidade: jest.fn().mockReturnValue(of(modalidade)),
      criarFaixa: jest.fn().mockReturnValue(of(faixa)),
      atualizarFaixa: jest.fn().mockReturnValue(of(faixa)),
      deletarFaixa: jest.fn().mockReturnValue(of(undefined)),
    };
    TestBed.configureTestingModule({
      imports: [ModalidadeListComponent],
      providers: [{ provide: ModalidadeApiService, useValue: api }],
    });
    const fixture = TestBed.createComponent(ModalidadeListComponent);
    fixture.detectChanges();
    return { fixture, api };
  }

  it('lista as modalidades ao iniciar', () => {
    const { fixture } = setup();
    expect(fixture.nativeElement.textContent).toContain('Jiu-Jitsu');
  });

  it('criar modalidade chama a API e limpa o campo', () => {
    const { fixture, api } = setup();
    const comp = fixture.componentInstance as any;
    comp.novoNome.set('Muay Thai');
    comp.criarModalidade();
    expect(api.criarModalidade).toHaveBeenCalledWith('Muay Thai');
    expect(comp.novoNome()).toBe('');
  });

  it('selecionar modalidade carrega suas faixas', () => {
    const { fixture, api } = setup();
    (fixture.componentInstance as any).selecionar(1);
    expect(api.faixas).toHaveBeenCalledWith(1);
  });

  it('adicionar faixa envia o payload com cor e graus', () => {
    const { fixture, api } = setup();
    const comp = fixture.componentInstance as any;
    comp.selecionar(1);
    comp.faixaNome.set('Roxa');
    comp.faixaCor.set('ROXA');
    comp.faixaOrdem.set('3');
    comp.faixaGrausMax.set('4');
    comp.salvarFaixa();
    expect(api.criarFaixa).toHaveBeenCalledWith(1, { nome: 'Roxa', cor: 'ROXA', ordem: 3, grausMax: 4 });
  });

  it('editar faixa usa atualizarFaixa com o id', () => {
    const { fixture, api } = setup();
    const comp = fixture.componentInstance as any;
    comp.selecionar(1);
    comp.editarFaixa(faixa);
    comp.salvarFaixa();
    expect(api.atualizarFaixa).toHaveBeenCalledWith(1, 10, expect.objectContaining({ nome: 'Azul', cor: 'AZUL' }));
  });
});
