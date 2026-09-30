import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PathsApi } from '../../../core/services/paths-api.service';

@Component({
  selector: 'app-path-create',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './path-create.html',
})
export class PathCreate {
  private fb = inject(FormBuilder);
  private api = inject(PathsApi);
  private router = inject(Router);

  readonly error = signal<string | null>(null);

  form = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    goalType: ['custom'],
  });

  submit() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.api.create({ title: v.title!, description: v.description || undefined, goalType: v.goalType || 'custom' }).subscribe({
      next: (p) => this.router.navigateByUrl(`/paths/${p.id}`),
      error: () => this.error.set('Login to create a path'),
    });
  }
}
