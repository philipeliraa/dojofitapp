import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GestaoLayoutComponent } from './gestao-layout.component';

describe('GestaoLayoutComponent', () => {
  it('renderiza as abas das 5 áreas de Gestão', () => {
    TestBed.configureTestingModule({
      imports: [GestaoLayoutComponent],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(GestaoLayoutComponent);
    fixture.detectChanges();

    const labels = Array.from(fixture.nativeElement.querySelectorAll('nav a')).map(
      (el: any) => el.textContent.trim(),
    );
    expect(labels).toEqual(['Usuários', 'Turmas', 'Aulas', 'Planos', 'Contratos']);
  });
});
