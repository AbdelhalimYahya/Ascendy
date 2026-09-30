import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface RunResult {
  mode: string;
  count: number;
  passed: number;
  results: {
    testCaseId: string;
    input: string;
    expectedOutput: string;
    stdout: string | null;
    stderr: string | null;
    pass: boolean;
    runtimeMs: number | null;
  }[];
}

export interface SubmitResult {
  verdict: string;
  submission: { id: string; verdict: string | null; runtimeMs: number | null; memoryKb: number | null };
  details: { pass: boolean; stdout: string | null; stderr: string | null }[];
}

@Injectable({ providedIn: 'root' })
export class SubmissionsApi {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  run(problemId: string, payload: { code: string; language: string }) {
    return this.http.post<RunResult>(`${this.base}/problems/${problemId}/run`, payload);
  }

  submit(problemId: string, payload: { code: string; language: string }) {
    return this.http.post<SubmitResult>(`${this.base}/problems/${problemId}/submit`, payload);
  }

  history(problemId: string) {
    return this.http.get<
      { id: string; language: string; verdict: string | null; runtimeMs: number | null; createdAt: string }[]
    >(`${this.base}/problems/${problemId}/submissions/me`);
  }
}
