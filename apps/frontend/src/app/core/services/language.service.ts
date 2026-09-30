import { Injectable, signal, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLang = 'en' | 'ar';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translate = inject(TranslateService);
  readonly lang = signal<AppLang>('en');

  constructor() {
    const saved = (localStorage.getItem('ascendy_lang') as AppLang) || 'en';
    this.use(saved, false);
    this.translate.onLangChange.subscribe((e) => {
      document.documentElement.lang = e.lang;
      document.documentElement.dir = e.lang === 'ar' ? 'rtl' : 'ltr';
    });
  }

  use(lang: AppLang, persist = true) {
    this.lang.set(lang);
    this.translate.setDefaultLang('en');
    this.translate.use(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('font-arabic', lang === 'ar');
    if (persist) localStorage.setItem('ascendy_lang', lang);
  }

  toggle() {
    this.use(this.lang() === 'en' ? 'ar' : 'en');
  }
}
