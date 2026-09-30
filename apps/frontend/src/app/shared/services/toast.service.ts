import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  kind: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private seq = 1;

  show(message: string, kind: Toast['kind'] = 'info') {
    const id = this.seq++;
    this.toasts.update((t) => [...t, { id, message, kind }]);
    setTimeout(() => this.dismiss(id), 3500);
  }

  success(m: string) {
    this.show(m, 'success');
  }

  error(m: string) {
    this.show(m, 'error');
  }

  dismiss(id: number) {
    this.toasts.update((t) => t.filter((x) => x.id !== id));
  }
}
