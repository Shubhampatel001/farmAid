import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { errorMessage } from '../../core/http';
import { FeedbackService } from '../../core/services/api.services';
import { ToastService } from '../../core/services/toast.service';
import { RATING_EMOJIS } from '../../shared/ratings';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-useraddfeedback',
  imports: [ReactiveFormsModule, FooterComponent],
  templateUrl: './useraddfeedback.component.html',
  styleUrl: './useraddfeedback.component.css',
})
export class UserAddFeedbackComponent {
  private readonly feedbackService = inject(FeedbackService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly ratings = RATING_EMOJIS;
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);

  protected readonly feedbackForm = inject(FormBuilder).nonNullable.group({
    feedbackText: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(2000)]],
    rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
  });

  protected addFeedback(): void {
    this.submitted.set(true);
    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const { feedbackText, rating } = this.feedbackForm.getRawValue();
    this.feedbackService.create({ feedbackText: feedbackText.trim(), rating }).subscribe({
      next: () => {
        this.toast.success('✅ Thank you for your feedback!');
        this.router.navigateByUrl('/my/feedback');
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(errorMessage(err));
      },
    });
  }
}
