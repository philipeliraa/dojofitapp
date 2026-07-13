import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Usuario, Role } from '../models/usuario.model';

export interface AuthResponse {
  token: string;
  user: Usuario;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<Usuario | null>(null);
  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUser());
  readonly role = computed(() => this.currentUser()?.role ?? null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      try {
        this.currentUser.set(JSON.parse(user));
      } catch {
        this.clearStorage();
      }
    }
  }

  login(email: string, senha: string) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, senha });
  }

  register(nome: string, email: string, senha: string) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, { nome, email, senha });
  }

  loginWithGoogle(idToken: string) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/google`, { idToken });
  }

  logout() {
    this.clearStorage();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  handleAuth(response: AuthResponse) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
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

  private clearStorage() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}
