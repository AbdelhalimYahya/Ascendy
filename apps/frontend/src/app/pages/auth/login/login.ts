import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApi } from '../../../core/services/auth-api.service';
import { AuthStore } from '../../../core/stores/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  private api = inject(AuthApi);
  private store = inject(AuthStore);
  private router = inject(Router);

  readonly error = signal<string | null>(null);
  readonly loading = signal(false);

  form = this.fb.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  submit() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    const v = this.form.getRawValue();
    this.api.login({ identifier: v.identifier!, password: v.password! }).subscribe({
      next: (r: { user: { id: string; email: string; username: string; languagePref: string; competitiveMode: boolean; avatarUrl?: string | null } }) => {
        this.store.setUser(r.user);
        this.router.navigateByUrl('/dashboard');
      },
      error: (e: unknown) => {
        const msg = (e as { error?: { message?: string } })?.error?.message ?? 'Invalid credentials';
        this.error.set(msg);
        this.loading.set(false);
      },
    });
  }
}
