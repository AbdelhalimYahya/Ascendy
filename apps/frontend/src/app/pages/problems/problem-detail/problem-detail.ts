import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProblemsApi, ProblemDetail } from '../../../core/services/problems-api.service';

@Component({
  selector: 'app-problem-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './problem-detail.html',
})
export class ProblemDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ProblemsApi);

  readonly problem = signal<ProblemDetail | null>(null);
  readonly error = signal<string | null>(null);

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.api.detail(slug).subscribe({
      next: (p) => this.problem.set(p),
      error: () => this.error.set('Problem not found'),
    });
  }
}
