import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApi } from '../../../core/services/auth-api.service';
import { AuthStore } from '../../../core/stores/auth.store';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  private fb = inject(FormBuilder);
  private api = inject(AuthApi);
  private store = inject(AuthStore);
  private router = inject(Router);

  readonly error = signal<string | null>(null);
  readonly loading = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_.-]+$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    const v = this.form.getRawValue();
    this.api
      .register({ email: v.email!, username: v.username!, password: v.password! })
      .subscribe({
        next: (r: { user: { id: string; email: string; username: string; languagePref: string; competitiveMode: boolean; avatarUrl?: string | null } }) => {
          this.store.setUser(r.user);
          this.router.navigateByUrl('/dashboard');
        },
        error: (e: unknown) => {
          const msg = (e as { error?: { message?: string } })?.error?.message ?? 'Registration failed';
          this.error.set(msg);
          this.loading.set(false);
        },
      });
  }
}
