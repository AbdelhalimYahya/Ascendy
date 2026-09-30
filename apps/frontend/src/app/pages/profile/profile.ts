import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsersApi, PublicProfile } from '../../core/services/users-api.service';
import { AuthStore } from '../../core/stores/auth.store';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(UsersApi);
  protected auth = inject(AuthStore);

  readonly profile = signal<PublicProfile | null>(null);
  readonly error = signal<string | null>(null);

  ngOnInit() {
    const username = this.route.snapshot.paramMap.get('username') ?? this.auth.user()?.username ?? '';
    if (!username) {
      this.error.set('No user');
      return;
    }
    this.api.profile(username).subscribe({
      next: (p) => this.profile.set(p),
      error: () => this.error.set('Profile not found'),
    });
  }
}
