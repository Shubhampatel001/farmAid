import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { errorMessage } from '../../core/http';
import { Loan } from '../../core/models';
import { LoanService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { calculateEmi, EmiResult } from '../../shared/emi';
import { filterAndSortLoans, LoanSortKey } from '../../shared/loan-table';
import { createPager, PaginationComponent } from '../../shared/pagination';
import { FooterComponent } from '../footer/footer.component';

/** Public loan catalogue; farmers can apply from here. */
@Component({
  selector: 'app-userviewloan',
  imports: [FormsModule, RouterLink, DecimalPipe, PaginationComponent, FooterComponent],
  templateUrl: './userviewloan.component.html',
  styleUrl: './userviewloan.component.css',
})
export class UserViewLoanComponent {
  protected readonly auth = inject(AuthService);
  private readonly loanService = inject(LoanService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly loans = signal<Loan[]>([]);
  protected readonly keyword = signal('');
  protected readonly sortKey = signal<LoanSortKey>('loanType');
  protected readonly sortOrder = signal<'asc' | 'desc'>('asc');

  // Admins also receive inactive loans from the API; this page only shows the live catalogue.
  protected readonly filtered = computed(() =>
    filterAndSortLoans(this.loans().filter((l) => l.active), this.keyword(), this.sortKey(), this.sortOrder()),
  );
  protected readonly pager = createPager(this.filtered, 5);

  protected readonly showCalculator = signal(false);
  protected readonly principal = signal<number | null>(null);
  protected readonly interestRate = signal<number | null>(null);
  protected readonly tenure = signal<number | null>(null);
  protected readonly emi = signal<EmiResult | null>(null);

  constructor() {
    this.loanService.list().subscribe({
      next: (loans) => {
        this.loans.set(loans);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(errorMessage(err, 'Could not load loan schemes.'));
      },
    });
  }

  protected onApply(loanId: number): void {
    const target = `/loans/${loanId}/apply`;
    if (this.auth.isLoggedIn()) {
      this.router.navigateByUrl(target);
    } else {
      this.toast.info('Please log in to apply for a loan.');
      this.router.navigate(['/login'], { queryParams: { returnUrl: target } });
    }
  }

  /** Opens the calculator pre-filled with the loan's rate and tenure. */
  protected openCalculator(loan: Loan): void {
    this.principal.set(loan.maximumAmount);
    this.interestRate.set(loan.interestRate);
    this.tenure.set(loan.repaymentTenure);
    this.calculateEMI();
    this.showCalculator.set(true);
  }

  protected calculateEMI(): void {
    this.emi.set(calculateEmi(Number(this.principal()), Number(this.interestRate()), Number(this.tenure())));
  }
}
