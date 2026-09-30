import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LangSwitcher } from './shared/components/lang-switcher/lang-switcher';
import { Toasts } from './shared/components/toasts/toasts';
import { LanguageService } from './core/services/language.service';
import { AuthStore } from './core/stores/auth.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, TranslatePipe, LangSwitcher, Toasts],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Ascendy');
  protected readonly isLight = signal(false);
  protected readonly i18n = inject(LanguageService);
  protected readonly auth = inject(AuthStore);

  constructor() {
    this.i18n.use(this.i18n.lang(), false);
    this.auth.init();
  }

  toggleTheme() {
    this.isLight.update((v) => !v);
    document.body.classList.toggle('light', this.isLight());
  }

  logout() {
    this.auth.logout();
  }
}
