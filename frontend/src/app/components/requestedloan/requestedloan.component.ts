import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { errorMessage } from '../../core/http';
import { APPLICATION_STATUSES, ApplicationStatus, LoanApplication } from '../../core/models';
import { ApplicationService } from '../../core/services/api.services';
import { ToastService } from '../../core/services/toast.service';
import { DocumentPreviewComponent } from '../../shared/document-preview.component';
import { ModalComponent } from '../../shared/modal.component';
import { createPager, PaginationComponent } from '../../shared/pagination';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-requestedloan',
  imports: [FormsModule, DatePipe, DecimalPipe, ModalComponent, PaginationComponent, StatusBadgeComponent, DocumentPreviewComponent],
  templateUrl: './requestedloan.component.html',
  styleUrl: './requestedloan.component.css',
})
export class RequestedLoanComponent {
  private readonly applications = inject(ApplicationService);
  private readonly toast = inject(ToastService);

  protected readonly statuses = APPLICATION_STATUSES;
  protected readonly loading = signal(true);
  protected readonly all = signal<LoanApplication[]>([]);
  protected readonly search = signal('');
  protected readonly statusFilter = signal<ApplicationStatus | ''>('PENDING');

  protected readonly selected = signal<LoanApplication | null>(null);
  protected readonly loadingDocument = signal(false);
  protected readonly decision = signal<{ app: LoanApplication; status: 'APPROVED' | 'REJECTED' } | null>(null);
  protected readonly remarks = signal('');
  protected readonly deciding = signal(false);

  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    return this.all().filter(
      (a) =>
        (!status || a.status === status) &&
        (!term || [a.farmPurpose, a.user.username, a.loan.loanType, a.district].some((v) => v.toLowerCase().includes(term))),
    );
  });
  protected readonly pager = createPager(this.filtered, 5);

  constructor() {
    this.applications.all().subscribe({
      next: (apps) => {
        this.all.set(apps);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(errorMessage(err, 'Could not load applications.'));
      },
    });
  }

  /** List rows omit the document; fetch it on demand. */
  protected showDetails(app: LoanApplication): void {
    this.selected.set(app);
    this.loadingDocument.set(true);
    this.applications.get(app.loanApplicationId).subscribe({
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

  protected openDecision(app: LoanApplication, status: 'APPROVED' | 'REJECTED'): void {
    this.remarks.set('');
    this.decision.set({ app, status });
  }

  protected confirmDecision(): void {
    const d = this.decision();
    if (!d) return;
    this.deciding.set(true);
    this.applications.decide(d.app.loanApplicationId, { status: d.status, remarks: this.remarks().trim() || undefined }).subscribe({
      next: (updated) => {
        const page = this.pager.page();
        this.all.update((list) => list.map((a) => (a.loanApplicationId === updated.loanApplicationId ? updated : a)));
        this.pager.page.set(Math.min(page, this.pager.totalPages()));
        if (this.selected()?.loanApplicationId === updated.loanApplicationId) {
          this.selected.set({ ...updated, file: this.selected()!.file });
        }
        this.deciding.set(false);
        this.decision.set(null);
        this.toast.success(`Application ${updated.status === 'APPROVED' ? 'approved' : 'rejected'}.`);
      },
      error: (err) => {
        this.deciding.set(false);
        this.toast.error(errorMessage(err));
      },
    });
  }
}
