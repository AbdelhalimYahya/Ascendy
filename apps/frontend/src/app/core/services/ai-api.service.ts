import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type AiMode = 'hint' | 'explain' | 'full_solution' | 'code_review';

@Injectable({ providedIn: 'root' })
export class AiApi {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  chat(payload: { conversationId?: string; problemId?: string; message: string; mode: AiMode; code?: string }) {
    return this.http.post<{ conversationId: string; reply: string }>(`${this.base}/ai/chat`, payload);
  }

  conversations() {
    return this.http.get<{ id: string; title: string | null; mode: string | null }[]>(
      `${this.base}/ai/conversations`,
    );
  }

  detail(id: string) {
    return this.http.get<{ id: string; messages: { role: string; content: string }[] }>(
      `${this.base}/ai/conversations/${id}`,
    );
  }
}
