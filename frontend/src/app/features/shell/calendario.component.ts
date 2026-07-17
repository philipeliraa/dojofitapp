import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { StudentScheduleComponent } from '../student/schedule/student-schedule.component';
import { ProfessorScheduleComponent } from '../professor/schedule/professor-schedule.component';

/**
 * Calendário (docs/02): mesma lógica de troca por papel do Início — ver
 * comentário em inicio.component.ts. A fusão real (override manual do
 * professor dentro do próprio Calendário, hoje só em Gestão/Chamada) é
 * trabalho da etapa 5.5.
 */
@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [StudentScheduleComponent, ProfessorScheduleComponent],
  template: `
    @if (authService.role() === 'ALUNO') {
      <app-student-schedule />
    } @else {
      <app-professor-schedule />
    }
  `,
})
export class CalendarioComponent {
  constructor(public authService: AuthService) {}
}
