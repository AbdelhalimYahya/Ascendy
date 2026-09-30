import {
  Component,
  input,
  signal,
  inject,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SubmissionsApi, RunResult, SubmitResult } from '../../../core/services/submissions-api.service';

declare global {
  interface Window {
    require?: {
      (paths: string[], cb: (...args: never[]) => void): void;
      config(cfg: unknown): void;
    };
    monaco?: {
      editor: {
        create(el: HTMLElement, opts: unknown): { getValue(): string; setValue(v: string): void; dispose(): void };
        setModelLanguage(model: unknown, lang: string): void;
        getModels(): { getValue(): string; setValue(v: string): void; dispose(): void; onDidChangeContent(cb: () => void): void }[];
      };
    };
  }
}

const DEFAULT_STARTER: Record<string, string> = {
  javascript: 'function solve(input) {\n  // parse input, return output\n  return "";\n}',
  python: 'def solve():\n    import sys\n    data = sys.stdin.read().strip()\n    print(data)',
  cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n  ios::sync_with_stdio(false);\n  cin.tie(nullptr);\n  return 0;\n}',
  java: 'import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n  }\n}',
};

function loadMonaco(): Promise<void> {
  if (window.monaco) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const loader = document.createElement('script');
    loader.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/loader.js';
    loader.onload = () => {
      try {
        window.require?.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs' } });
        window.require?.(['vs/editor/editor.main'], () => resolve());
      } catch (e) {
        reject(e);
      }
    };
    loader.onerror = reject;
    document.head.appendChild(loader);
  });
}

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './code-editor.html',
})
export class CodeEditor implements OnInit, OnDestroy {
  readonly problemId = input.required<string>();
  readonly starterCode = input<Record<string, string> | null | undefined>(undefined);

  @ViewChild('editorHost', { static: true }) host!: ElementRef<HTMLDivElement>;

  private api = inject(SubmissionsApi);
  private editorInstance: { getValue(): string; setValue(v: string): void; dispose(): void } | null = null;

  readonly language = signal('python');
  readonly code = signal('');
  readonly running = signal(false);
  readonly submitting = signal(false);
  readonly runResult = signal<RunResult | null>(null);
  readonly submitResult = signal<SubmitResult | null>(null);
  readonly history = signal<{ id: string; language: string; verdict: string | null; runtimeMs: number | null; createdAt: string }[]>([]);
  readonly notice = signal<string | null>(null);
  readonly monacoReady = signal(false);

  async ngOnInit() {
    const starters = (this.starterCode() as Record<string, string> | undefined) ?? {};
    this.code.set(starters['python'] || DEFAULT_STARTER['python']);
    this.loadHistory();
    try {
      await loadMonaco();
      const monaco = window.monaco!;
      this.editorInstance = monaco.editor.create(this.host.nativeElement, {
        value: this.code(),
        language: 'python',
        theme: 'vs-dark',
        minimap: { enabled: false },
        fontSize: 13,
        automaticLayout: true,
      });
      this.monacoReady.set(true);
      const model = monaco.editor.getModels()[0];
      model?.onDidChangeContent(() => this.code.set(model.getValue()));
    } catch {
      this.notice.set('Monaco CDN blocked — using fallback editor below');
    }
  }

  ngOnDestroy() {
    try {
      this.editorInstance?.dispose();
    } catch {}
  }

  setLanguage(lang: string) {
    this.language.set(lang);
    const starters = (this.starterCode() as Record<string, string> | undefined) ?? {};
    const next = starters[lang] || DEFAULT_STARTER[lang] || '';
    this.code.set(next);
    try {
      const monaco = window.monaco;
      const model = monaco?.editor.getModels()[0];
      if (model && monaco) {
        model.setValue(next);
        monaco.editor.setModelLanguage(model as never, lang === 'cpp' ? 'cpp' : lang);
      } else {
        this.editorInstance?.setValue(next);
      }
    } catch {}
  }

  onFallbackInput(v: string) {
    this.code.set(v);
  }

  run() {
    this.running.set(true);
    this.runResult.set(null);
    this.api.run(this.problemId(), { code: this.currentCode(), language: this.language() }).subscribe({
      next: (r) => {
        this.runResult.set(r);
        this.running.set(false);
        if (r.results[0]?.stderr?.includes('Judge0 disabled')) {
          this.notice.set('Judge0 not enabled — set JUDGE0_ENABLED=true + JUDGE0_URL on backend for real runs');
        }
      },
      error: () => {
        this.running.set(false);
        this.notice.set('Run needs login + backend up');
      },
    });
  }

  submit() {
    this.submitting.set(true);
    this.submitResult.set(null);
    this.api
      .submit(this.problemId(), { code: this.currentCode(), language: this.language() })
      .subscribe({
        next: (r) => {
          this.submitResult.set(r);
          this.submitting.set(false);
          this.loadHistory();
        },
        error: () => {
          this.submitting.set(false);
          this.notice.set('Submit needs login + backend up');
        },
      });
  }

  loadHistory() {
    this.api.history(this.problemId()).subscribe({
      next: (h) => this.history.set(h),
      error: () => {},
    });
  }

  private currentCode() {
    try {
      return this.editorInstance?.getValue() ?? this.code();
    } catch {
      return this.code();
    }
  }
}
