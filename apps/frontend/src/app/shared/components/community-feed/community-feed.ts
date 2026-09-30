import { Component, input, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SocialApi, ShowcasePost } from '../../../core/services/social-api.service';

@Component({
  selector: 'app-community-feed',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './community-feed.html',
})
export class CommunityFeed implements OnInit {
  readonly problemId = input.required<string>();
  private api = inject(SocialApi);
  private fb = inject(FormBuilder);

  readonly posts = signal<ShowcasePost[]>([]);
  readonly showForm = signal(false);

  form = this.fb.group({
    title: ['', [Validators.required]],
    content: ['', [Validators.required]],
    codeSnippet: [''],
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.posts(this.problemId()).subscribe({ next: (p) => this.posts.set(p), error: () => {} });
  }

  vote(p: ShowcasePost, v: 1 | -1) {
    const prev = p.score;
    p.score += v; // optimistic
    this.api.vote(p.id, v).subscribe({
      next: (r) => (p.score = r.score),
      error: () => (p.score = prev),
    });
  }

  share() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.api
      .create(this.problemId(), {
        title: v.title!,
        content: v.content!,
        codeSnippet: v.codeSnippet || undefined,
      })
      .subscribe({
        next: () => {
          this.form.reset();
          this.showForm.set(false);
          this.load();
        },
      });
  }
}
