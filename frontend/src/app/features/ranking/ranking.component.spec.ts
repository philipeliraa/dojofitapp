import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { RankingComponent } from './ranking.component';
import { RankingApiService } from '../../core/services/ranking-api.service';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../core/models/usuario.model';
import { RankingItem } from '../../core/models/ranking.model';

describe('RankingComponent', () => {
  function setup(itens: RankingItem[], meuId = 2) {
    const api = { listar: jest.fn().mockReturnValue(of(itens)) };
    TestBed.configureTestingModule({
      imports: [RankingComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RankingApiService, useValue: api },
      ],
    });
    const authService = TestBed.inject(AuthService);
    authService.handleAuth({
      token: 't',
      user: { id: meuId, nome: 'Eu', email: 'eu@dojofit.com', role: 'ALUNO', ativo: true, criadoEm: '' } as Usuario,
    });
    const fixture = TestBed.createComponent(RankingComponent);
    fixture.detectChanges();
    return { fixture, api };
  }

  const ana: RankingItem = { posicao: 1, alunoId: 1, alunoNome: 'Ana', totalTreinos: 8 };
  const eu: RankingItem = { posicao: 2, alunoId: 2, alunoNome: 'Eu', totalTreinos: 5 };

  it('lista os alunos com posição e total de treinos', () => {
    const { fixture } = setup([ana, eu]);
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Ana');
    expect(text).toContain('8 treino');
  });

  it('mostra medalha para o top 3', () => {
    const { fixture } = setup([ana, eu]);
    expect(fixture.nativeElement.textContent).toContain('🥇');
  });

  it('destaca a linha do próprio usuário', () => {
    const { fixture } = setup([ana, eu], 2);
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('(você)');
    const destacada = fixture.nativeElement.querySelector('.ring-brand-blue');
    expect(destacada).toBeTruthy();
  });

  it('mostra estado vazio quando ninguém treinou', () => {
    const { fixture } = setup([]);
    expect(fixture.nativeElement.textContent).toContain('Ninguém treinou este mês');
  });
});
