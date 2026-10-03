import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ModalComponent } from '../../shared/modal.component';

@Component({
  selector: 'app-usernav',
  imports: [RouterLink, ModalComponent],
  templateUrl: './usernav.component.html',
  styleUrl: './usernav.component.css',
})
export class UserNavComponent {
  protected readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  protected readonly showLogout = signal(false);

  protected logout(): void {
    this.showLogout.set(false);
    this.auth.logout('/');
    this.toast.info('You have been logged out.');
  }
}
