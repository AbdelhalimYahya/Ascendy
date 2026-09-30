import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  languagePref: string;
  competitiveMode: boolean;
  avatarUrl?: string | null;
}

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  register(payload: { email: string; username: string; password: string }) {
    return this.http
      .post<AuthResponse>(`${this.base}/auth/register`, payload)
      .pipe(tap((r) => this.saveTokens(r)));
  }

  login(payload: { identifier: string; password: string }) {
    return this.http
      .post<AuthResponse>(`${this.base}/auth/login`, payload)
      .pipe(tap((r) => this.saveTokens(r)));
  }

  refresh() {
    const refreshToken = localStorage.getItem('ascendy_refresh');
    return this.http
      .post<{ accessToken: string; refreshToken: string }>(`${this.base}/auth/refresh`, {
        refreshToken,
      })
      .pipe(tap((r) => this.saveTokens(r)));
  }

  me() {
    return this.http.get<AuthUser>(`${this.base}/auth/me`);
  }

  private saveTokens(r: { accessToken: string; refreshToken: string }) {
    localStorage.setItem('ascendy_access', r.accessToken);
    localStorage.setItem('ascendy_refresh', r.refreshToken);
  }

  logout() {
    localStorage.removeItem('ascendy_access');
    localStorage.removeItem('ascendy_refresh');
  }
}
