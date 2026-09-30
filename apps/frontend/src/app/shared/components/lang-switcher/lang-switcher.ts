import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-lang-switcher',
  standalone: true,
  template: `
    <button
      (click)="lang.toggle()"
      class="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white/5 px-3 py-2 text-sm font-semibold hover:bg-white/10 transition"
      [attr.aria-label]="lang.lang() === 'en' ? 'Switch to Arabic' : 'Switch to English'"
    >
      <span>{{ lang.lang() === 'en' ? 'ع' : 'EN' }}</span>
      <span class="text-mist text-xs">{{ lang.lang() === 'en' ? 'AR' : 'عربي' }}</span>
    </button>
  `,
})
export class LangSwitcher {
  readonly lang = inject(LanguageService);
}
