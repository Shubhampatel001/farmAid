import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { errorMessage } from '../../core/http';
import { Feedback } from '../../core/models';
import { FeedbackService } from '../../core/services/api.services';
import { ToastService } from '../../core/services/toast.service';
import { ModalComponent } from '../../shared/modal.component';
import { emojiFor } from '../../shared/ratings';

@Component({
  selector: 'app-adminviewfeedback',
  imports: [FormsModule, DatePipe, ModalComponent],
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
  protected readonly toDelete = signal<Feedback | null>(null);
  protected readonly deleting = signal(false);

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

  protected confirmDelete(fb: Feedback): void {
    this.deleting.set(true);
    this.feedbackService.delete(fb.feedbackId).subscribe({
      next: () => {
        this.feedback.update((list) => list.filter((f) => f.feedbackId !== fb.feedbackId));
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
