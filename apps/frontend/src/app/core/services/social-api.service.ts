import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ShowcasePost {
  id: string;
  title: string;
  content: string;
  codeSnippet: string | null;
  author: { username: string };
  score: number;
  _count: { comments: number };
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class SocialApi {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  posts(problemId: string) {
    return this.http.get<ShowcasePost[]>(`${this.base}/problems/${problemId}/posts`);
  }

  create(problemId: string, payload: { title: string; content: string; codeSnippet?: string }) {
    return this.http.post<ShowcasePost>(`${this.base}/problems/${problemId}/posts`, payload);
  }

  vote(postId: string, value: 1 | -1) {
    return this.http.post<{ score: number }>(`${this.base}/posts/${postId}/vote`, { value });
  }

  comments(postId: string) {
    return this.http.get<{ id: string; content: string; author: { username: string } }[]>(
      `${this.base}/posts/${postId}/comments`,
    );
  }

  comment(postId: string, content: string) {
    return this.http.post(`${this.base}/posts/${postId}/comments`, { content });
  }
}
