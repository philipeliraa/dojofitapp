import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { StudentHomeComponent } from '../student/home/student-home.component';
import { AttendanceComponent } from '../professor/attendance/attendance.component';

/**
 * Início (docs/02): uma tela, conteúdo por papel — Aluno vê a jornada
 * pessoal (streak, aulas do dia); Professor/Admin vê a operação do dia
 * (turmas, presença). Aqui só troca QUAL componente já existente é
 * montado — a consolidação de verdade (um único CheckInService em vez
 * dos três atuais) é trabalho da etapa 5.5.
 */
@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [StudentHomeComponent, AttendanceComponent],
  template: `
    @if (authService.role() === 'ALUNO') {
      <app-student-home />
    } @else {
      <app-attendance />
    }
  `,
})
export class InicioComponent {
  constructor(public authService: AuthService) {}
}
