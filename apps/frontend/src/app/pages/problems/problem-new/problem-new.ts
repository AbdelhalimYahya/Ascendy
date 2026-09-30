import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProblemsApi } from '../../../core/services/problems-api.service';

@Component({
  selector: 'app-problem-new',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './problem-new.html',
})
export class ProblemNew {
  private fb = inject(FormBuilder);
  private api = inject(ProblemsApi);
  private router = inject(Router);

  readonly error = signal<string | null>(null);
  readonly loading = signal(false);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    statement: [''],
    difficulty: ['Easy', [Validators.required]],
    sourcePlatform: ['Custom'],
    sourceUrl: [''],
    tags: [''],
    python: ['def solve():\n    pass'],
    javascript: ['function solve() {\n}'],
  });

  submit() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    const v = this.form.getRawValue();
    this.api
      .create({
        title: v.title!,
        statement: v.statement || undefined,
        difficulty: v.difficulty!,
        sourcePlatform: v.sourcePlatform || 'Custom',
        sourceUrl: v.sourceUrl || undefined,
        tags: (v.tags || '').split(',').map((s) => s.trim()).filter(Boolean),
        starterCode: { python: v.python || '', javascript: v.javascript || '' },
      })
      .subscribe({
        next: (p) => this.router.navigateByUrl(`/problems/${p.slug}`),
        error: (e: unknown) => {
          this.error.set((e as { error?: { message?: string } })?.error?.message ?? 'Failed to create');
          this.loading.set(false);
        },
      });
  }
}
