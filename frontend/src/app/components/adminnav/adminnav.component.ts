import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ModalComponent } from '../../shared/modal.component';

@Component({
  selector: 'app-adminnav',
  imports: [RouterLink, ModalComponent],
  templateUrl: './adminnav.component.html',
  styleUrl: './adminnav.component.css',
})
export class AdminNavComponent {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  protected readonly showLogout = signal(false);

  protected logout(): void {
    this.showLogout.set(false);
    this.auth.logout('/');
    this.toast.info('You have been logged out.');
  }
}
