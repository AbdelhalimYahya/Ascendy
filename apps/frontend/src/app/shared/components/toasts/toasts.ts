import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toasts',
  standalone: true,
  template: `
    <div class="fixed bottom-4 end-4 z-[100] space-y-2">
      @for (t of toast.toasts(); track t.id) {
        <div
          class="rounded-xl border px-4 py-2.5 text-sm shadow-glass backdrop-blur-xl"
          [class]="
            t.kind === 'success'
              ? 'border-mint/40 bg-mint/15 text-mint'
              : t.kind === 'error'
                ? 'border-red-400/40 bg-red-500/15 text-red-200'
                : 'border-line bg-abyss/90 text-slate-200'
          "
        >
          {{ t.message }}
        </div>
      }
    </div>
  `,
})
export class Toasts {
  readonly toast = inject(ToastService);
}
