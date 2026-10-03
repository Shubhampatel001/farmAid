import { Component, computed, input } from '@angular/core';
import { ApplicationStatus } from '../core/models';

const STYLES: Record<ApplicationStatus, string> = {
  PENDING: 'text-bg-warning',
  APPROVED: 'text-bg-success',
  REJECTED: 'text-bg-danger',
  CANCELLED: 'text-bg-secondary',
};

@Component({
  selector: 'app-status-badge',
  template: `<span class="badge status-badge {{ style() }}">{{ label() }}</span>`,
})
export class StatusBadgeComponent {
  readonly status = input.required<ApplicationStatus>();
  protected readonly style = computed(() => STYLES[this.status()]);
  protected readonly label = computed(() => this.status().charAt(0) + this.status().slice(1).toLowerCase());
}
