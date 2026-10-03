import { Component, inject } from '@angular/core';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="toast-stack" aria-live="polite">
      @for (toast of toasts.toasts(); track toast.id) {
        <div class="alert alert-{{ toast.kind }} alert-dismissible shadow mb-0" role="alert">
          {{ toast.text }}
          <button type="button" class="btn-close" aria-label="Close" (click)="toasts.dismiss(toast.id)"></button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  protected readonly toasts = inject(ToastService);
}
