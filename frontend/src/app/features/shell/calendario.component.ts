import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CalendarioAlunoComponent } from '../calendario/calendario-aluno.component';
import { CalendarioProfessorComponent } from '../calendario/calendario-professor.component';

/**
 * Calendário (docs/02): mesma lógica de troca por papel do Início. A
 * consolidação da etapa 5.5 já entrega o override manual do professor
 * embutido no Calendário (antes só existia na Chamada/Início).
 */
@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CalendarioAlunoComponent, CalendarioProfessorComponent],
  template: `
    @if (authService.role() === 'ALUNO') {
      <app-calendario-aluno />
    } @else {
      <app-calendario-professor />
    }
  `,
})
export class CalendarioComponent {
  constructor(public authService: AuthService) {}
}
