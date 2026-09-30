import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PathsApi } from '../../../core/services/paths-api.service';

@Component({
  selector: 'app-path-detail',
  standalone: true,
  templateUrl: './path-detail.html',
})
export class PathDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(PathsApi);

  readonly path = signal<{ id: string; title: string; description: string | null; goalType: string | null; steps: { id: string; order: number; title: string; problem: { slug: string; title: string } | null }[] } | null>(null);
  readonly followers = signal<{ currentStep: number; user: { username: string } }[]>([]);
  readonly msg = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.detail(id).subscribe({ next: (p) => this.path.set(p) });
    this.api.followers(id).subscribe({ next: (f) => this.followers.set(f) });
  }

  follow() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.follow(id).subscribe({
      next: () => {
        this.msg.set('Following ✓ — your progress is visible to fellow climbers');
        this.api.followers(id).subscribe({ next: (f) => this.followers.set(f) });
      },
      error: () => this.msg.set('Login to follow'),
    });
  }
}
