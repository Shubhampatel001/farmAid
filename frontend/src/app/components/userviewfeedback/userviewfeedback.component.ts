import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { errorMessage } from '../../core/http';
import { Feedback } from '../../core/models';
import { FeedbackService } from '../../core/services/api.services';
import { ToastService } from '../../core/services/toast.service';
import { ModalComponent } from '../../shared/modal.component';
import { emojiFor } from '../../shared/ratings';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-userviewfeedback',
  imports: [RouterLink, DatePipe, ModalComponent, FooterComponent],
  templateUrl: './userviewfeedback.component.html',
  styleUrl: './userviewfeedback.component.css',
})
export class UserViewFeedbackComponent {
  private readonly feedbackService = inject(FeedbackService);
  private readonly toast = inject(ToastService);

  protected readonly emojiFor = emojiFor;
  protected readonly loading = signal(true);
  protected readonly feedback = signal<Feedback[]>([]);
  protected readonly toDelete = signal<Feedback | null>(null);
  protected readonly deleting = signal(false);

  constructor() {
    this.feedbackService.mine().subscribe({
      next: (list) => {
        this.feedback.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(errorMessage(err, 'Could not load your feedback.'));
      },
    });
  }

  protected confirmDelete(item: Feedback): void {
    this.deleting.set(true);
    this.feedbackService.delete(item.feedbackId).subscribe({
      next: () => {
        this.feedback.update((list) => list.filter((f) => f.feedbackId !== item.feedbackId));
        this.deleting.set(false);
        this.toDelete.set(null);
        this.toast.success('Feedback deleted.');
      },
      error: (err) => {
        this.deleting.set(false);
        this.toast.error(errorMessage(err));
      },
    });
  }
}
