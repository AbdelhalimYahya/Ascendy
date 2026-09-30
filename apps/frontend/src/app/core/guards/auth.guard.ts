import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../stores/auth.store';

export const authGuard: CanActivateFn = () => {
  const store = inject(AuthStore);
  const router = inject(Router);
  if (store.isAuthenticated()) return true;
  const token = localStorage.getItem('ascendy_access');
  if (token) return true; // optimistic — me() will validate in background
  router.navigateByUrl('/auth/login');
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const store = inject(AuthStore);
  const router = inject(Router);
  if (store.isAuthenticated() || localStorage.getItem('ascendy_access')) {
    router.navigateByUrl('/dashboard');
    return false;
  }
  return true;
};
