import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { errorMessage } from '../../core/http';
import { LoanRequest } from '../../core/models';
import { LoanService } from '../../core/services/api.services';
import { ToastService } from '../../core/services/toast.service';

/** Create (/admin/loans/new) and edit (/admin/loans/:loanId/edit) a loan scheme. */
@Component({
  selector: 'app-loan-editor',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './admineditloan.component.html',
  styleUrl: './admineditloan.component.css',
})
export class LoanEditorComponent implements OnInit {
  private readonly loans = inject(LoanService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  /** Route param; absent when creating. */
  readonly loanId = input<string>();
  protected readonly isEdit = computed(() => !!this.loanId());

  protected readonly months = [6, 12, 18, 24, 36, 48, 60, 84, 120];
  protected readonly loadingLoan = signal(false);
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);

  protected readonly loanForm = inject(FormBuilder).group({
    loanType: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
    interestRate: [null as number | null, [Validators.required, Validators.min(0.01), Validators.max(100)]],
    maximumAmount: [null as number | null, [Validators.required, Validators.min(1)]],
    repaymentTenure: [null as number | null, Validators.required],
    eligibility: ['', [Validators.required, Validators.maxLength(1000)]],
    documentsRequired: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  ngOnInit(): void {
    if (!this.isEdit()) return;
    this.loadingLoan.set(true);
    this.loans.get(Number(this.loanId())).subscribe({
      next: (loan) => {
        if (!this.months.includes(loan.repaymentTenure)) {
          this.months.push(loan.repaymentTenure);
          this.months.sort((a, b) => a - b);
        }
        this.loanForm.patchValue(loan);
        this.loadingLoan.set(false);
      },
      error: (err) => {
        this.toast.error(errorMessage(err, 'Could not load the loan.'));
        this.router.navigateByUrl('/admin/loans');
      },
    });
  }

  protected invalid(name: keyof typeof this.loanForm.controls): boolean {
    const c = this.loanForm.controls[name];
    return c.invalid && (this.submitted() || c.touched);
  }

  protected onSubmit(): void {
    this.submitted.set(true);
    if (this.loanForm.invalid) {
      this.loanForm.markAllAsTouched();
      return;
    }
    const request = this.loanForm.getRawValue() as LoanRequest;
    this.saving.set(true);
    const call = this.isEdit() ? this.loans.update(Number(this.loanId()), request) : this.loans.create(request);
    call.subscribe({
      next: () => {
        this.toast.success(this.isEdit() ? 'Loan updated successfully.' : 'Loan created successfully.');
        this.router.navigateByUrl('/admin/loans');
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(errorMessage(err));
      },
    });
  }
}
