import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { errorMessage } from '../../core/http';
import { Loan, LoanApplicationRequest } from '../../core/models';
import { ApplicationService, LoanService, LocationService } from '../../core/services/api.services';
import { ToastService } from '../../core/services/toast.service';
import { ModalComponent } from '../../shared/modal.component';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];

@Component({
  selector: 'app-loanform',
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe, ModalComponent],
  templateUrl: './loanform.component.html',
  styleUrl: './loanform.component.css',
})
export class LoanFormComponent implements OnInit {
  private readonly loanService = inject(LoanService);
  private readonly applications = inject(ApplicationService);
  private readonly location = inject(LocationService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  /** Route param. */
  readonly loanId = input.required<string>();

  protected readonly loan = signal<Loan | null>(null);
  protected readonly loadingLoan = signal(true);
  protected readonly states = signal<string[]>([]);
  protected readonly districts = signal<string[]>([]);
  protected readonly showEligibility = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly readingFile = signal(false);
  protected readonly fileError = signal('');
  protected readonly fileName = signal('');

  protected readonly loanForm = inject(FormBuilder).nonNullable.group({
    requestedAmount: [null as number | null, [Validators.required, Validators.min(1)]],
    state: ['', Validators.required],
    district: ['', Validators.required],
    farmLocation: ['', [Validators.required, Validators.maxLength(255)]],
    farmerAddress: ['', [Validators.required, Validators.maxLength(500)]],
    farmSizeInAcres: [null as number | null, [Validators.required, Validators.min(0.01)]],
    farmPurpose: ['', [Validators.required, Validators.maxLength(1000)]],
    file: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loanService.get(Number(this.loanId())).subscribe({
      next: (loan) => {
        this.loan.set(loan);
        this.loanForm.controls.requestedAmount.addValidators(Validators.max(loan.maximumAmount));
        this.loanForm.controls.requestedAmount.updateValueAndValidity();
        this.loadingLoan.set(false);
      },
      error: (err) => {
        this.toast.error(errorMessage(err, 'This loan scheme is not available.'));
        this.router.navigateByUrl('/loans');
      },
    });

    this.location.states().subscribe({
      next: (states) => this.states.set(states),
      error: () => this.toast.error('Could not load the list of states.'),
    });

    this.loanForm.controls.state.valueChanges
      .pipe(
        switchMap((state) => {
          this.loanForm.controls.district.setValue('');
          return state ? this.location.districts(state) : of([]);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((districts) => this.districts.set(districts));
  }

  protected invalid(name: keyof typeof this.loanForm.controls): boolean {
    const c = this.loanForm.controls[name];
    return c.invalid && (this.submitted() || c.touched);
  }

  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.fileError.set('');
    this.loanForm.controls.file.setValue('');
    this.loanForm.controls.file.markAsTouched();
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      this.fileError.set('Only PNG, JPG, WEBP or PDF files are allowed.');
      input.value = '';
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      this.fileError.set('File must be smaller than 5 MB.');
      input.value = '';
      return;
    }
    this.readingFile.set(true);
    const reader = new FileReader();
    reader.onload = () => {
      this.loanForm.controls.file.setValue(reader.result as string);
      this.fileName.set(file.name);
      this.readingFile.set(false);
    };
    reader.onerror = () => {
      this.fileError.set('Could not read the file. Please try another one.');
      this.readingFile.set(false);
    };
    reader.readAsDataURL(file);
  }

  protected onSubmit(): void {
    this.submitted.set(true);
    if (this.loanForm.invalid) {
      this.loanForm.markAllAsTouched();
      return;
    }
    const value = this.loanForm.getRawValue();
    const request: LoanApplicationRequest = {
      ...value,
      loanId: Number(this.loanId()),
      requestedAmount: Number(value.requestedAmount),
      farmSizeInAcres: Number(value.farmSizeInAcres),
    };
    this.submitting.set(true);
    this.applications.apply(request).subscribe({
      next: () => {
        this.toast.success('✅ Application submitted! You can track it under Applied Loans.');
        this.router.navigateByUrl('/my/applications');
      },
      error: (err) => {
        this.submitting.set(false);
        this.toast.error(errorMessage(err, 'Could not submit your application.'));
      },
    });
  }
}
