import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { PathsApi, PathItem } from '../../../core/services/paths-api.service';

@Component({
  selector: 'app-paths-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './paths-list.html',
})
export class PathsList implements OnInit {
  private api = inject(PathsApi);
  private fb = inject(FormBuilder);

  readonly items = signal<PathItem[]>([]);
  filters = this.fb.group({ goalType: [''] });

  ngOnInit() {
    this.load();
  }

  load() {
    const g = this.filters.getRawValue().goalType || undefined;
    this.api.list(g).subscribe({ next: (items) => this.items.set(items) });
  }
}
