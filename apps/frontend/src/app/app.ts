import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Ascendy');
  protected readonly isLight = signal(false);

  toggleTheme() {
    this.isLight.update((v) => !v);
    document.body.classList.toggle('light', this.isLight());
  }
}
