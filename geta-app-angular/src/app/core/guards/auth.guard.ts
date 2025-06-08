import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// O AuthGuard agora é uma função, não uma classe.
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se o token existir, o utilizador pode aceder à rota.
  if (authService.token) {
    return true;
  }

  // Se não, redireciona para a página de login.
  return router.createUrlTree(['/auth']);
};
