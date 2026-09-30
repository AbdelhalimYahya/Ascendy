import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LangSwitcher } from './shared/components/lang-switcher/lang-switcher';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, TranslatePipe, LangSwitcher],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Ascendy');
  protected readonly isLight = signal(false);
  protected readonly i18n = inject(LanguageService);

  constructor() {
    // Initialize lang/dir from storage
    this.i18n.use(this.i18n.lang(), false);
  }

  toggleTheme() {
    this.isLight.update((v) => !v);
    document.body.classList.toggle('light', this.isLight());
  }
}
