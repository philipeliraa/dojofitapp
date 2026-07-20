import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AlunoListComponent } from './aluno-list.component';
import { AlunoApiService } from '../../../core/services/aluno-api.service';

describe('AlunoListComponent', () => {
  function setup(alunos: unknown[]) {
    const alunoApi = { listar: jest.fn().mockReturnValue(of(alunos)) };
    TestBed.configureTestingModule({
      imports: [AlunoListComponent],
      providers: [provideRouter([]), { provide: AlunoApiService, useValue: alunoApi }],
    });
    const fixture = TestBed.createComponent(AlunoListComponent);
    fixture.detectChanges();
    return { fixture, alunoApi };
  }

  it('lista os alunos com nome e link para o detalhe', () => {
    const { fixture } = setup([{ id: 3, nome: 'João Aluno', email: 'joao@dojofit.com' }]);
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('João Aluno');
    const links = Array.from(fixture.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];
    expect(links.some(l => l.getAttribute('href')?.endsWith('/3'))).toBe(true);
  });

  it('mostra estado vazio quando não há alunos', () => {
    const { fixture } = setup([]);
    expect(fixture.nativeElement.textContent).toContain('Nenhum aluno cadastrado');
  });
});
