import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-error',
  imports: [RouterLink],
  template: `
    <div class="error-container">
      <h1>Oops! Something Went Wrong 😞</h1>
      <p>The page you're looking for doesn't exist or an error has occurred.</p>
      <i class="bi bi-signpost-split error-icon" aria-hidden="true"></i>
      <button routerLink="/">Go Back to Home page</button>
    </div>
  `,
  styleUrl: './error.component.css',
})
export class ErrorComponent {}
