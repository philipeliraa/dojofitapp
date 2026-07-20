import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NotificacaoBellComponent } from './notificacao-bell.component';
import { NotificacaoApiService } from '../../core/services/notificacao-api.service';
import { Notificacao } from '../../core/models/notificacao.model';

describe('NotificacaoBellComponent', () => {
  const notificacao = (over: Partial<Notificacao> = {}): Notificacao => ({
    id: 1, tipo: 'GRADUACAO', titulo: 'Nova graduação!', mensagem: 'Você foi graduado para Azul em Jiu-Jitsu.',
    lida: false, referenciaId: 5, criadoEm: '2026-07-19T10:00:00', ...over,
  });

  function setup(count: number, lista: Notificacao[]) {
    const api = {
      contarNaoLidas: jest.fn().mockReturnValue(of({ count })),
      listar: jest.fn().mockReturnValue(of(lista)),
      marcarLida: jest.fn().mockReturnValue(of(undefined)),
    };
    TestBed.configureTestingModule({
      imports: [NotificacaoBellComponent],
      providers: [{ provide: NotificacaoApiService, useValue: api }],
    });
    const fixture = TestBed.createComponent(NotificacaoBellComponent);
    fixture.detectChanges();
    return { fixture, api };
  }

  it('mostra o contador de não-lidas ao iniciar', () => {
    const { fixture } = setup(3, []);
    expect(fixture.nativeElement.textContent).toContain('3');
  });

  it('abrir o sino carrega a lista de notificações', () => {
    const { fixture, api } = setup(1, [notificacao()]);
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    expect(api.listar).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Nova graduação!');
  });

  it('clicar numa não-lida marca como lida e reduz o contador', () => {
    const { fixture, api } = setup(1, [notificacao()]);
    const comp = fixture.componentInstance as any;
    comp.alternar();
    fixture.detectChanges();

    const itens = fixture.nativeElement.querySelectorAll('button');
    // itens[0] é o próprio sino; o item da lista é o segundo botão
    itens[1].click();
    expect(api.marcarLida).toHaveBeenCalledWith(1);
    expect(comp.naoLidas()).toBe(0);
  });
});
