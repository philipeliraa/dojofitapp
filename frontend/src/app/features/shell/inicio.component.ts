import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { InicioAlunoComponent } from '../checkin/inicio-aluno.component';
import { ChamadaComponent } from '../checkin/chamada.component';

/**
 * Início (docs/02): uma tela, conteúdo por papel — Aluno vê a jornada
 * pessoal (streak, aulas do dia); Professor/Admin vê a operação do dia
 * (turmas, presença). Consolidação da etapa 5.5: ambos consomem o mesmo
 * CheckInService, antes cada um tinha sua própria lógica duplicada.
 */
@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [InicioAlunoComponent, ChamadaComponent],
  template: `
    @if (authService.role() === 'ALUNO') {
      <app-inicio-aluno />
    } @else {
      <app-chamada />
    }
  `,
})
export class InicioComponent {
  constructor(public authService: AuthService) {}
}
