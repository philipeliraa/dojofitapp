import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = route.data?.['roles'] as string[] | undefined;

  if (!allowedRoles || allowedRoles.includes(authService.role()!)) {
    return true;
  }

  // Usuário autenticado mas sem permissão para esta rota — volta ao Início
  // (a casca é a mesma para todos os papéis, então não faz sentido deslogar)
  router.navigate(['/']);
  return false;
};
