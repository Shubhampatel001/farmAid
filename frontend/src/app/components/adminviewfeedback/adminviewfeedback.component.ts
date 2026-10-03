import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { errorMessage } from '../../core/http';
import { Feedback } from '../../core/models';
import { FeedbackService } from '../../core/services/api.services';
import { ToastService } from '../../core/services/toast.service';
import { emojiFor } from '../../shared/ratings';

/** Admin view of all feedback. Read-only: only the author can delete their feedback. */
@Component({
  selector: 'app-adminviewfeedback',
  imports: [FormsModule, DatePipe],
  templateUrl: './adminviewfeedback.component.html',
  styleUrl: './adminviewfeedback.component.css',
})
export class AdminViewFeedbackComponent {
  private readonly feedbackService = inject(FeedbackService);
  private readonly toast = inject(ToastService);

  protected readonly emojiFor = emojiFor;
  protected readonly loading = signal(true);
  protected readonly feedback = signal<Feedback[]>([]);
  protected readonly search = signal('');

  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.feedback();
    return this.feedback().filter(
      (f) => String(f.userId) === term || f.username.toLowerCase().includes(term) || f.feedbackText.toLowerCase().includes(term),
    );
  });

  constructor() {
    this.feedbackService.all().subscribe({
      next: (list) => {
        this.feedback.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(errorMessage(err, 'Could not load feedback.'));
      },
    });
  }
}
