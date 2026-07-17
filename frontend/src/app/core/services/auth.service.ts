import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, finalize, firstValueFrom, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, Role } from '../models/usuario.model';

export interface AuthResponse {
  token: string;
  user: Usuario;
}

/**
 * Sessão conforme docs/07 seção 7: o access token vive SOMENTE em memória
 * (Signal) — nunca em localStorage. A persistência entre reloads é o refresh
 * token em cookie httpOnly, que o JavaScript não consegue ler: ao abrir o app,
 * restoreSession() troca o cookie por um novo access token.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessToken = signal<string | null>(null);
  private currentUser = signal<Usuario | null>(null);
  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUser());
  readonly role = computed(() => this.currentUser()?.role ?? null);

  private refreshInFlight: Observable<AuthResponse> | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, senha: string) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, senha }, { withCredentials: true });
  }

  /** Cadastro só via convite: e-mail e papel vêm do convite no backend (docs/06 fluxo 2). */
  register(nome: string, senha: string, conviteToken: string) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, { nome, senha, conviteToken }, { withCredentials: true });
  }

  getConvitePreview(token: string) {
    return this.http.get<{ email: string; role: Role }>(`${environment.apiUrl}/auth/convites/${token}`);
  }

  loginWithGoogle(idToken: string) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/google`, { idToken }, { withCredentials: true });
  }

  /** Chamado no bootstrap do app: se houver cookie de refresh válido, restaura a sessão em silêncio. */
  async restoreSession(): Promise<void> {
    try {
      await firstValueFrom(this.refreshSession$());
    } catch {
      // Sem cookie ou sessão expirada — segue deslogado, guards redirecionam
    }
  }

  /** Renova o access token; chamadas concorrentes compartilham a mesma requisição. */
  refreshSession$(): Observable<AuthResponse> {
    if (!this.refreshInFlight) {
      this.refreshInFlight = this.http
        .post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, {}, { withCredentials: true })
        .pipe(
          tap(res => {
            this.accessToken.set(res.token);
            this.currentUser.set(res.user);
          }),
          finalize(() => (this.refreshInFlight = null)),
          shareReplay(1),
        );
    }
    return this.refreshInFlight;
  }

  logout() {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true }).subscribe({
      complete: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  /** Limpa a sessão em memória e volta ao login (usado no logout e quando o refresh falha). */
  clearSession() {
    this.accessToken.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.accessToken();
  }

  handleAuth(response: AuthResponse) {
    this.accessToken.set(response.token);
    this.currentUser.set(response.user);
    this.redirectByRole(response.user.role);
  }

  private redirectByRole(role: Role) {
    switch (role) {
      case 'ADMIN':
        this.router.navigate(['/admin']);
        break;
      case 'PROFESSOR':
        this.router.navigate(['/professor']);
        break;
      default:
        this.router.navigate(['/student']);
    }
  }
}
