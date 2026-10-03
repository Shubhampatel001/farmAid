import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, FormsModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  private readonly toast = inject(ToastService);
  protected readonly year = new Date().getFullYear();

  // No newsletter backend yet; acknowledge locally.
  protected subscribe(form: NgForm): void {
    if (form.invalid) return;
    this.toast.success('Thanks for subscribing!');
    form.resetForm();
  }
}
