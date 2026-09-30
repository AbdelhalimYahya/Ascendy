import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { UsersApi } from '../../core/services/users-api.service';
import { AuthStore } from '../../core/stores/auth.store';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './settings.html',
})
export class Settings implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(UsersApi);
  protected auth = inject(AuthStore);
  private i18n = inject(LanguageService);

  readonly saved = signal(false);

  form = this.fb.group({
    bio: [''],
    competitiveMode: [true],
    languagePref: ['en'],
  });

  ngOnInit() {
    const u = this.auth.user();
    this.form.patchValue({
      bio: '',
      competitiveMode: u?.competitiveMode ?? true,
      languagePref: (u?.languagePref as string) ?? 'en',
    });
  }

  save() {
    const v = this.form.getRawValue();
    this.api
      .updateMe({
        bio: v.bio ?? '',
        competitiveMode: !!v.competitiveMode,
        languagePref: (v.languagePref as string) ?? 'en',
      })
      .subscribe({
        next: () => {
          this.saved.set(true);
          const lang = (v.languagePref as 'en' | 'ar') ?? 'en';
          this.i18n.use(lang);
          const u = this.auth.user();
          if (u) this.auth.setUser({ ...u, competitiveMode: !!v.competitiveMode, languagePref: lang });
          setTimeout(() => this.saved.set(false), 2000);
        },
      });
  }
}
