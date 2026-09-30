import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ProgressStats {
  totalAttempted: number;
  solvedCount: number;
  byDifficulty: Record<string, number>;
  streak: number;
}

@Injectable({ providedIn: 'root' })
export class ProgressApi {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  upsert(payload: { problemId: string; status: string; timeSpentMin?: number; language?: string; notes?: string }) {
    return this.http.post(`${this.base}/progress`, payload);
  }

  mine(status?: string) {
    return this.http.get<unknown[]>(`${this.base}/progress/me${status ? `?status=${status}` : ''}`);
  }

  stats() {
    return this.http.get<ProgressStats>(`${this.base}/progress/stats/me`);
  }

  speed() {
    return this.http.get<{ points: unknown[]; byDifficulty: Record<string, { count: number; avgMin: number }> }>(
      `${this.base}/progress/speed-trends/me`,
    );
  }

  mastery() {
    return this.http.get<{ tag: string; score: number }[]>(`${this.base}/progress/mastery/me`);
  }
}
