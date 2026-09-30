import { Component, input, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProblemsApi } from '../../../core/services/problems-api.service';

@Component({
  selector: 'app-similar-problems',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="rounded-2xl border border-line bg-void/60 p-5">
      <h3 class="font-display font-bold">Similar problems ✨</h3>
      @if (!items().length) {
        <p class="mt-2 text-sm text-mist">No similar ones yet — solve more to unlock recommendations.</p>
      }
      <div class="mt-3 space-y-2">
        @for (p of items(); track p.id) {
          <a [routerLink]="['/problems', p.slug]" class="block rounded-xl bg-white/5 p-3 text-sm hover:bg-white/10">
            <span class="font-semibold">{{ p.title }}</span>
            <span class="ms-2 text-xs text-mist">{{ p.difficulty }}</span>
          </a>
        }
      </div>
    </div>
  `,
})
export class SimilarProblems implements OnInit {
  readonly problemId = input.required<string>();
  private api = inject(ProblemsApi);
  readonly items = signal<{ id: string; slug: string; title: string; difficulty: string }[]>([]);

  ngOnInit() {
    this.api.similar(this.problemId()).subscribe({
      next: (j) => this.items.set(j as never[]),
      error: () => {},
    });
  }
}
