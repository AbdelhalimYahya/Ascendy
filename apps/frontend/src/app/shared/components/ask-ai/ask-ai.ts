import { Component, input, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AiApi, AiMode } from '../../../core/services/ai-api.service';

@Component({
  selector: 'app-ask-ai',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './ask-ai.html',
})
export class AskAi {
  readonly problemId = input<string | undefined>(undefined);
  private api = inject(AiApi);
  private fb = inject(FormBuilder);

  readonly mode = signal<AiMode>('hint');
  readonly messages = signal<{ role: string; content: string }[]>([]);
  readonly loading = signal(false);
  readonly conversationId = signal<string | undefined>(undefined);

  form = this.fb.group({ message: ['', [Validators.required]] });

  setMode(m: AiMode) {
    this.mode.set(m);
  }

  send() {
    if (this.form.invalid || this.loading()) return;
    const text = this.form.getRawValue().message!;
    this.messages.update((arr) => [...arr, { role: 'user', content: text }]);
    this.form.reset();
    this.loading.set(true);
    this.api
      .chat({
        conversationId: this.conversationId(),
        problemId: this.problemId(),
        message: text,
        mode: this.mode(),
      })
      .subscribe({
        next: (r) => {
          this.conversationId.set(r.conversationId);
          this.messages.update((arr) => [...arr, { role: 'assistant', content: r.reply }]);
          this.loading.set(false);
        },
        error: () => {
          this.messages.update((arr) => [...arr, { role: 'assistant', content: 'Login + backend needed for AI.' }]);
          this.loading.set(false);
        },
      });
  }
}
