import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProgressApi, ProgressStats } from '../../core/services/progress-api.service';
import { AuthStore } from '../../core/stores/auth.store';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private api = inject(ProgressApi);
  protected auth = inject(AuthStore);

  readonly stats = signal<ProgressStats | null>(null);
  readonly mastery = signal<{ tag: string; score: number }[]>([]);
  readonly speed = signal<Record<string, { count: number; avgMin: number }>>({});

  ngOnInit() {
    this.api.stats().subscribe({ next: (s) => this.stats.set(s), error: () => {} });
    this.api.mastery().subscribe({ next: (m) => this.mastery.set(m), error: () => {} });
    this.api.speed().subscribe({ next: (s) => this.speed.set(s.byDifficulty), error: () => {} });
  }
}
