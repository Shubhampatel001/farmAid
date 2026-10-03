import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { errorMessage } from '../../core/http';
import { Loan } from '../../core/models';
import { LoanService } from '../../core/services/api.services';
import { ToastService } from '../../core/services/toast.service';
import { filterAndSortLoans, LoanSortKey } from '../../shared/loan-table';
import { ModalComponent } from '../../shared/modal.component';
import { createPager, PaginationComponent } from '../../shared/pagination';

@Component({
  selector: 'app-viewloan',
  imports: [FormsModule, RouterLink, DecimalPipe, ModalComponent, PaginationComponent],
  templateUrl: './viewloan.component.html',
  styleUrl: './viewloan.component.css',
})
export class ViewLoanComponent {
  private readonly loanService = inject(LoanService);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly loans = signal<Loan[]>([]);
  protected readonly keyword = signal('');
  protected readonly sortKey = signal<LoanSortKey>('loanType');
  protected readonly sortOrder = signal<'asc' | 'desc'>('asc');
  protected readonly toDeactivate = signal<Loan | null>(null);
  protected readonly busyId = signal<number | null>(null);

  protected readonly filtered = computed(() => filterAndSortLoans(this.loans(), this.keyword(), this.sortKey(), this.sortOrder()));
  protected readonly pager = createPager(this.filtered, 5);

  constructor() {
    this.loanService.list().subscribe({
      next: (loans) => {
        this.loans.set(loans);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(errorMessage(err, 'Could not load loans.'));
      },
    });
  }

  protected setActive(loan: Loan, active: boolean): void {
    this.busyId.set(loan.loanId);
    this.loanService.setActive(loan.loanId, active).subscribe({
      next: (updated) => {
        // Keep the current page: replace in place instead of re-fetching.
        const page = this.pager.page();
        this.loans.update((list) => list.map((l) => (l.loanId === updated.loanId ? updated : l)));
        this.pager.page.set(Math.min(page, this.pager.totalPages()));
        this.busyId.set(null);
        this.toDeactivate.set(null);
        this.toast.success(`${updated.loanType} ${active ? 'reactivated' : 'deactivated'}.`);
      },
      error: (err) => {
        this.busyId.set(null);
        this.toast.error(errorMessage(err));
      },
    });
  }
}
