import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ProblemListItem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  sourcePlatform: string | null;
  tags: { tag: { id: string; name: string } }[];
}

export interface ProblemDetail extends ProblemListItem {
  statement: string | null;
  starterCode: Record<string, string> | null;
  sourceUrl: string | null;
  testCases: { id: string; input: string; expectedOutput: string }[];
}

@Injectable({ providedIn: 'root' })
export class ProblemsApi {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  list(params: { page?: number; difficulty?: string; tag?: string; search?: string; sourcePlatform?: string } = {}) {
    let p = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) p = p.set(k, String(v));
    });
    return this.http.get<{ total: number; page: number; items: ProblemListItem[] }>(
      `${this.base}/problems`,
      { params: p },
    );
  }

  detail(slug: string) {
    return this.http.get<ProblemDetail>(`${this.base}/problems/${slug}`);
  }

  create(payload: {
    title: string;
    statement?: string;
    difficulty: string;
    starterCode?: Record<string, string>;
    sourceUrl?: string;
    sourcePlatform?: string;
    tags?: string[];
  }) {
    return this.http.post<ProblemListItem>(`${this.base}/problems`, payload);
  }

  similar(id: string) {
    return this.http.get<ProblemListItem[]>(`${this.base}/problems/${id}/similar`);
  }

  tags() {
    return this.http.get<{ id: string; name: string }[]>(`${this.base}/tags`);
  }
}
