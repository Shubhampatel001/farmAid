import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from './models';
import { AuthService } from './services/auth.service';

/** Requires login, and the role in route data `role` when present. */
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
  const required = route.data['role'] as Role | undefined;
  if (required && auth.role() !== required) {
    return router.createUrlTree([auth.homeFor(auth.role())]);
  }
  return true;
};

/** Keeps logged-in users away from login/signup. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isLoggedIn() ? inject(Router).createUrlTree([auth.homeFor(auth.role())]) : true;
};
