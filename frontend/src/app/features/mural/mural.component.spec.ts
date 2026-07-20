import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { MuralComponent } from './mural.component';
import { AvisoApiService } from '../../core/services/aviso-api.service';
import { AuthService } from '../../core/services/auth.service';
import { Aviso } from '../../core/models/aviso.model';
import { Usuario } from '../../core/models/usuario.model';

function aviso(over: Partial<Aviso> = {}): Aviso {
  return {
    id: 1,
    titulo: 'Treino especial',
    conteudo: 'Sábado às 10h',
    autorId: 9,
    autorNome: 'Prof. Carlos',
    criadoEm: '2026-07-19T10:00:00',
    feedbacks: [],
    ...over,
  };
}

describe('MuralComponent', () => {
  function setup(role: Usuario['role'], avisos: Aviso[] = [], userId = 1) {
    const avisoApi = {
      listar: jest.fn().mockReturnValue(of(avisos)),
      criar: jest.fn().mockReturnValue(of(aviso())),
      deletar: jest.fn().mockReturnValue(of(undefined)),
      adicionarFeedback: jest.fn().mockReturnValue(of({})),
      deletarFeedback: jest.fn().mockReturnValue(of(undefined)),
    };

    TestBed.configureTestingModule({
      imports: [MuralComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AvisoApiService, useValue: avisoApi },
      ],
    });

    const authService = TestBed.inject(AuthService);
    authService.handleAuth({
      token: 't',
      user: { id: userId, nome: 'Fulano', email: 'f@dojofit.com', role, ativo: true, criadoEm: '' } as Usuario,
    });

    const fixture = TestBed.createComponent(MuralComponent);
    fixture.detectChanges();
    return { fixture, avisoApi };
  }

  it('carrega o feed ao iniciar', () => {
    const { avisoApi } = setup('ALUNO');
    expect(avisoApi.listar).toHaveBeenCalled();
  });

  it('Aluno não vê o formulário de publicação', () => {
    const { fixture } = setup('ALUNO');
    expect(fixture.nativeElement.textContent).not.toContain('Publicar aviso');
  });

  it('Professor vê o formulário de publicação', () => {
    const { fixture } = setup('PROFESSOR');
    expect(fixture.nativeElement.textContent).toContain('Publicar aviso');
  });

  it('mostra estado vazio quando não há avisos', () => {
    const { fixture } = setup('ALUNO', []);
    expect(fixture.nativeElement.textContent).toContain('Tudo tranquilo por aqui');
  });

  it('renderiza título e conteúdo dos avisos', () => {
    const { fixture } = setup('ALUNO', [aviso({ titulo: 'Feriado', conteudo: 'Sem aula segunda' })]);
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Feriado');
    expect(text).toContain('Sem aula segunda');
  });

  const comFeedback = () => [aviso({ feedbacks: [{ id: 5, avisoId: 1, autorId: 2, autorNome: 'Maria', conteudo: 'Posso levar visitante?', criadoEm: '2026-07-19T11:00:00' }] })];

  it('equipe vê o nome do autor do feedback', () => {
    const { fixture } = setup('PROFESSOR', comFeedback());
    expect(fixture.nativeElement.textContent).toContain('Maria');
  });

  it('aluno vê o conteúdo do feedback mas não o nome do autor (privacidade visual)', () => {
    const { fixture } = setup('ALUNO', comFeedback());
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Posso levar visitante?');
    expect(text).not.toContain('Maria');
  });

  it('publicar chama a API e limpa o formulário', () => {
    const { fixture, avisoApi } = setup('PROFESSOR');
    const comp = fixture.componentInstance as any;
    comp.novoTitulo.set('Aviso');
    comp.novoConteudo.set('Mensagem');
    comp.publicar();
    expect(avisoApi.criar).toHaveBeenCalledWith('Aviso', 'Mensagem');
    expect(comp.novoTitulo()).toBe('');
  });

  it('não publica com campos vazios', () => {
    const { fixture, avisoApi } = setup('PROFESSOR');
    (fixture.componentInstance as any).publicar();
    expect(avisoApi.criar).not.toHaveBeenCalled();
  });

  it('enviar feedback chama a API com o rascunho do aviso', () => {
    const { fixture, avisoApi } = setup('ALUNO', [aviso({ id: 42 })]);
    const comp = fixture.componentInstance as any;
    comp.setRascunho(42, 'Confirmado!');
    comp.enviarFeedback(42);
    expect(avisoApi.adicionarFeedback).toHaveBeenCalledWith(42, 'Confirmado!');
  });

  it('aluno pode excluir o próprio feedback, não o de outro', () => {
    const { fixture } = setup('ALUNO', [], 1);
    const comp = fixture.componentInstance as any;
    expect(comp.podeExcluirFeedback(1)).toBe(true);
    expect(comp.podeExcluirFeedback(2)).toBe(false);
  });
});
