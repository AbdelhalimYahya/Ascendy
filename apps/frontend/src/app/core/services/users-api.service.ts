import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface PublicProfile {
  id: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  languagePref: string;
  createdAt: string;
  solvedCount: number;
  competitiveMode: boolean;
  _count: { progressEntries: number; posts: number; roadmaps: number };
}

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  profile(username: string) {
    return this.http.get<PublicProfile>(`${this.base}/users/${username}`);
  }

  updateMe(payload: { bio?: string; avatarUrl?: string; languagePref?: string; competitiveMode?: boolean }) {
    return this.http.patch(`${this.base}/users/me`, payload);
  }
}
