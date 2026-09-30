import { Component, inject, signal, OnInit } from '@angular/core';
import { AiApi } from '../../core/services/ai-api.service';
import { AskAi } from '../../shared/components/ask-ai/ask-ai';

@Component({
  selector: 'app-ai',
  standalone: true,
  imports: [AskAi],
  template: `
    <div class="mx-auto max-w-5xl py-8">
      <h1 class="font-display text-3xl font-bold">AI Coach</h1>
      <p class="text-sm text-mist">Post-practice learning — hints, explanations, reviews. Not live cheating.</p>
      <div class="mt-4 grid gap-4 md:grid-cols-[1fr_2fr]">
        <div class="glass h-fit p-4">
          <h3 class="font-display font-bold">History</h3>
          @if (!convs().length) {
            <p class="mt-2 text-sm text-mist">No conversations yet.</p>
          }
          @for (c of convs(); track c.id) {
            <div class="mt-2 rounded-lg bg-white/5 p-2 text-sm">{{ c.title || c.id }} <span class="text-mist">({{ c.mode }})</span></div>
          }
        </div>
        <app-ask-ai />
      </div>
    </div>
  `,
})
export class Ai implements OnInit {
  private api = inject(AiApi);
  readonly convs = signal<{ id: string; title: string | null; mode: string | null }[]>([]);

  ngOnInit() {
    this.api.conversations().subscribe({ next: (c) => this.convs.set(c), error: () => {} });
  }
}
