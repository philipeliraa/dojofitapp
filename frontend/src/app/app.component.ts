import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConnectionService } from './core/services/connection.service';
import { CheckinSyncService } from './offline/checkin-sync.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    @if (!connection.online()) {
      <div class="bg-brand-navy text-white text-sm text-center py-2 px-4">
        Sem conexão — suas ações serão sincronizadas quando a rede voltar
      </div>
    }
    <router-outlet />
  `,
})
export class AppComponent {
  constructor(
    public connection: ConnectionService,
    // Injetado para ativar a sincronização automática da fila offline ao reconectar
    private checkinSync: CheckinSyncService,
  ) {}
}
