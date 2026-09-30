import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ProblemsApi, ProblemListItem } from '../../../core/services/problems-api.service';

@Component({
  selector: 'app-problems-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './problems-list.html',
})
export class ProblemsList implements OnInit {
  private api = inject(ProblemsApi);
  private fb = inject(FormBuilder);

  readonly items = signal<ProblemListItem[]>([]);
  readonly total = signal(0);
  readonly loading = signal(true);
  readonly tags = signal<{ id: string; name: string }[]>([]);

  filters = this.fb.group({
    search: [''],
    difficulty: [''],
    tag: [''],
    sourcePlatform: [''],
    hideSolved: [false],
  });

  ngOnInit() {
    this.api.tags().subscribe({ next: (t) => this.tags.set(t), error: () => {} });
    this.load();
  }

  load() {
    this.loading.set(true);
    const v = this.filters.getRawValue();
    this.api
      .list({
        search: v.search || undefined,
        difficulty: v.difficulty || undefined,
        tag: v.tag || undefined,
        sourcePlatform: v.sourcePlatform || undefined,
      })
      .subscribe({
        next: (r) => {
          this.items.set(r.items);
          this.total.set(r.total);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  difficultyColor(d: string) {
    return d === 'Easy'
      ? 'text-mint border-mint/30 bg-mint/10'
      : d === 'Medium'
        ? 'text-amberglow border-amberglow/30 bg-amberglow/10'
        : 'text-red-300 border-red-400/30 bg-red-500/10';
  }
}
