import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, FooterComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {
  protected readonly quotes = [
    { text: 'Agriculture is the most healthful, most useful and most noble employment of man.', author: 'George Washington' },
    { text: 'Agriculture is the ancient, essential and the foremost important occupation in the world.', author: 'Mahatma Gandhi' },
    { text: 'Farming is a profession of hope.', author: 'Brett Brian' },
  ];
  protected readonly activeQuote = signal(0);

  constructor() {
    const timer = setInterval(() => this.activeQuote.update((i) => (i + 1) % this.quotes.length), 4000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }
}
