import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface PathItem {
  id: string;
  title: string;
  description: string | null;
  goalType: string | null;
  author: { username: string };
  _count: { steps: number; follows: number };
}

@Injectable({ providedIn: 'root' })
export class PathsApi {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  list(goalType?: string) {
    let p = new HttpParams();
    if (goalType) p = p.set('goalType', goalType);
    return this.http.get<PathItem[]>(`${this.base}/roadmaps`, { params: p });
  }

  detail(id: string) {
    return this.http.get<{
      id: string;
      title: string;
      description: string | null;
      goalType: string | null;
      steps: { id: string; order: number; title: string; description: string | null; problem: { slug: string; title: string } | null }[];
    }>(`${this.base}/roadmaps/${id}`);
  }

  create(payload: { title: string; description?: string; goalType?: string }) {
    return this.http.post<PathItem>(`${this.base}/roadmaps`, payload);
  }

  addStep(id: string, payload: { order: number; title: string; description?: string; problemId?: string }) {
    return this.http.post(`${this.base}/roadmaps/${id}/steps`, payload);
  }

  follow(id: string) {
    return this.http.post(`${this.base}/roadmaps/${id}/follow`, {});
  }

  followers(id: string) {
    return this.http.get<{ currentStep: number; user: { username: string } }[]>(
      `${this.base}/roadmaps/${id}/followers`,
    );
  }
}
