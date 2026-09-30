import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApi, AuthUser } from '../services/auth-api.service';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private api = inject(AuthApi);
  private router = inject(Router);

  readonly user = signal<AuthUser | null>(null);
  readonly isAuthenticated = computed(() => !!this.user());
  readonly initialized = signal(false);

  init() {
    const token = localStorage.getItem('ascendy_access');
    if (!token) {
      this.initialized.set(true);
      return;
    }
    this.api.me().subscribe({
      next: (u) => {
        this.user.set(u);
        this.initialized.set(true);
      },
      error: () => {
        this.api.logout();
        this.initialized.set(true);
      },
    });
  }

  setUser(u: AuthUser) {
    this.user.set(u);
  }

  logout() {
    this.api.logout();
    this.user.set(null);
    this.router.navigateByUrl('/');
  }
}
