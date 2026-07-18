import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PlanoListComponent } from './plano-list.component';
import { environment } from '../../../../environments/environment';
import { Plano } from '../../../core/models/plano.model';

describe('PlanoListComponent', () => {
  let httpMock: HttpTestingController;

  const plano: Plano = { id: 1, nome: '3x semana', limiteSemanal: 3, ativo: true };

  function setup() {
    TestBed.configureTestingModule({
      imports: [PlanoListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(PlanoListComponent);
    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiUrl}/planos`).flush([plano]);
    fixture.detectChanges();
    return { fixture };
  }

  afterEach(() => httpMock.verify());

  it('mostra os planos com o limite semanal', () => {
    const { fixture } = setup();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('3x semana');
    expect(text).toContain('3');
  });

  it('plano sem limite mostra "Ilimitado"', () => {
    const { fixture } = setup();
    fixture.componentInstance.planos.set([{ ...plano, limiteSemanal: null }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Ilimitado');
  });

  it('excluir plano chama o backend e recarrega', () => {
    const { fixture } = setup();
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    fixture.nativeElement.querySelectorAll('tbody button')[2].click();
    httpMock.expectOne(`${environment.apiUrl}/planos/1`).flush(null);
    httpMock.expectOne(`${environment.apiUrl}/planos`).flush([]);
  });
});
