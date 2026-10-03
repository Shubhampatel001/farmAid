import { Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-support',
  imports: [FormsModule, FooterComponent],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css',
})
export class SupportComponent {
  protected readonly submitted = signal(false);

  // TODO: send to a support endpoint / email service once one exists; for now acknowledge locally.
  protected submitForm(form: NgForm): void {
    if (form.invalid) return;
    this.submitted.set(true);
    form.resetForm();
  }
}
