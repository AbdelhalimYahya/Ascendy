import { Component, input, inject, signal } from '@angular/core';
import { ProgressApi } from '../../../core/services/progress-api.service';

@Component({
  selector: 'app-progress-widget',
  standalone: true,
  template: `
    <div class="flex flex-wrap items-center gap-2">
      <button (click)="mark('Attempted')" class="btn-ghost !py-2 text-sm">Mark attempted</button>
      <button (click)="mark('Solved')" class="btn-primary !py-2 text-sm">Mark solved ✓</button>
      @if (msg()) {
        <span class="pill">{{ msg() }}</span>
      }
    </div>
  `,
})
export class ProgressWidget {
  readonly problemId = input.required<string>();
  private api = inject(ProgressApi);
  readonly msg = signal<string | null>(null);

  mark(status: string) {
    this.api.upsert({ problemId: this.problemId(), status }).subscribe({
      next: () => this.msg.set(status === 'Solved' ? 'Solved ✓ streak updated' : 'Saved as attempted'),
      error: () => this.msg.set('Login to track progress'),
    });
  }
}
