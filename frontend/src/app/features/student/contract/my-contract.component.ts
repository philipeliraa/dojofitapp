import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Contrato } from '../../../core/models/contrato.model';

@Component({
  selector: 'app-my-contract',
  standalone: true,
  template: `
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Meu Contrato</h2>

      @if (loading()) {
        <div class="text-center py-8 text-gray-400">Carregando...</div>
      } @else if (contratos().length === 0) {
        <div class="text-center py-8 text-gray-500">Nenhum contrato encontrado. Procure o administrador.</div>
      } @else {
        <div class="space-y-4">
          @for (contrato of contratos(); track contrato.id) {
            <div class="bg-white rounded-xl shadow-sm p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold text-gray-900">{{ contrato.planoNome }}</h3>
                <span class="text-xs px-2 py-1 rounded-full"
                      [class]="contrato.status === 'ATIVO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                  {{ contrato.status }}
                </span>
              </div>

              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500">Inicio</span>
                  <span class="text-gray-900">{{ contrato.dataInicio }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Validade</span>
                  <span class="text-gray-900">{{ contrato.dataValidade }}</span>
                </div>
              </div>

              @if (weekInfo()) {
                <div class="mt-4 pt-3 border-t">
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-500">Check-ins esta semana</span>
                    <span class="font-medium">{{ weekInfo()!.count }}</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full transition-all" [style.width.%]="progressPercent()"></div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class MyContractComponent implements OnInit {
  contratos = signal<Contrato[]>([]);
  weekInfo = signal<{ count: number } | null>(null);
  loading = signal(true);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<Contrato[]>(`${environment.apiUrl}/contratos/meu`).subscribe({
      next: data => { this.contratos.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.http.get<{ count: number }>(`${environment.apiUrl}/checkins/semana`).subscribe(data => this.weekInfo.set(data));
  }

  progressPercent(): number {
    const count = this.weekInfo()?.count ?? 0;
    // Find active contract's plan limit
    const ativo = this.contratos().find(c => c.status === 'ATIVO');
    if (!ativo) return 0;
    // We don't have limiteSemanal in ContractResponse, so show raw count
    return Math.min(count * 20, 100);
  }
}
