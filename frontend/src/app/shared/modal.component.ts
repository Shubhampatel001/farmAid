import { Component, input, output } from '@angular/core';

/**
 * Bootstrap-styled modal driven by Angular state (no Bootstrap JS), so it works with signals
 * and zoneless change detection. Render it inside an @if block.
 */
@Component({
  selector: 'app-modal',
  host: { '(document:keydown.escape)': 'closed.emit()' },
  template: `
    <div class="app-modal-backdrop" (click)="closed.emit()">
      <div class="modal d-block" tabindex="-1" role="dialog" aria-modal="true" [attr.aria-label]="title()">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" [class]="sizeClass()" (click)="$event.stopPropagation()">
          <div class="modal-content" [class.border-danger]="variant() === 'danger'">
            <div class="modal-header" [class]="headerClass()">
              <h5 class="modal-title">{{ title() }}</h5>
              <button type="button" class="btn-close" [class.btn-close-white]="variant() === 'danger'" aria-label="Close" (click)="closed.emit()"></button>
            </div>
            <div class="modal-body">
              <ng-content />
            </div>
            <div class="modal-footer">
              <ng-content select="[modal-footer]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ModalComponent {
  readonly title = input.required<string>();
  readonly variant = input<'default' | 'danger' | 'warning'>('default');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly closed = output<void>();

  protected sizeClass(): string {
    return this.size() === 'md' ? '' : `modal-${this.size()}`;
  }

  protected headerClass(): string {
    switch (this.variant()) {
      case 'danger':
        return 'bg-danger text-white';
      case 'warning':
        return 'bg-warning text-dark';
      default:
        return '';
    }
  }
}
