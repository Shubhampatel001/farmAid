import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { errorMessage } from '../../core/http';
import { LoanApplication } from '../../core/models';
import { ApplicationService } from '../../core/services/api.services';
import { ToastService } from '../../core/services/toast.service';
import { DocumentPreviewComponent } from '../../shared/document-preview.component';
import { ModalComponent } from '../../shared/modal.component';
import { createPager, PaginationComponent } from '../../shared/pagination';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-userappliedloan',
  imports: [
    FormsModule, RouterLink, DatePipe, DecimalPipe, ModalComponent, PaginationComponent, StatusBadgeComponent,
    DocumentPreviewComponent, FooterComponent,
  ],
  templateUrl: './userappliedloan.component.html',
  styleUrl: './userappliedloan.component.css',
})
export class UserAppliedLoanComponent {
  private readonly applicationService = inject(ApplicationService);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly applications = signal<LoanApplication[]>([]);
  protected readonly search = signal('');
  protected readonly selected = signal<LoanApplication | null>(null);
  protected readonly loadingDocument = signal(false);
  protected readonly toCancel = signal<LoanApplication | null>(null);
  protected readonly cancelling = signal(false);

  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    return term
      ? this.applications().filter((a) => a.farmPurpose.toLowerCase().includes(term) || a.loan.loanType.toLowerCase().includes(term))
      : this.applications();
  });
  protected readonly pager = createPager(this.filtered, 5);

  constructor() {
    this.applicationService.mine().subscribe({
      next: (apps) => {
        this.applications.set(apps);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(errorMessage(err, 'Could not load your applications.'));
      },
    });
  }

  protected showDetails(app: LoanApplication): void {
    this.selected.set(app);
    this.loadingDocument.set(true);
    this.applicationService.get(app.loanApplicationId).subscribe({
      next: (full) => {
        if (this.selected()?.loanApplicationId === full.loanApplicationId) this.selected.set(full);
        this.loadingDocument.set(false);
      },
      error: (err) => {
        this.loadingDocument.set(false);
        this.toast.error(errorMessage(err, 'Could not load the document.'));
      },
    });
  }

  protected confirmCancel(app: LoanApplication): void {
    this.cancelling.set(true);
    this.applicationService.cancel(app.loanApplicationId).subscribe({
      next: (updated) => {
        const page = this.pager.page();
        this.applications.update((list) => list.map((a) => (a.loanApplicationId === updated.loanApplicationId ? updated : a)));
        this.pager.page.set(Math.min(page, this.pager.totalPages()));
        this.cancelling.set(false);
        this.toCancel.set(null);
        this.toast.success('Application cancelled.');
      },
      error: (err) => {
        this.cancelling.set(false);
        this.toCancel.set(null);
        this.toast.error(errorMessage(err));
      },
    });
  }
}
