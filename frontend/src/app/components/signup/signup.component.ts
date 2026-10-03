import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { errorMessage } from '../../core/http';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

/** Same rule as the backend (AuthDtos.PASSWORD_RULE). */
export const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/;

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const { password, confirmPassword } = group.value as { password: string; confirmPassword: string };
  return password && confirmPassword && password !== confirmPassword ? { mismatch: true } : null;
}

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly regForm = inject(NonNullableFormBuilder).group(
    {
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.maxLength(100)]],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, Validators.pattern(STRONG_PASSWORD)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  private readonly password = toSignal(this.regForm.controls.password.valueChanges, { initialValue: '' });
  protected readonly criteria = computed(() => {
    const p = this.password();
    return {
      uppercase: /[A-Z]/.test(p),
      lowercase: /[a-z]/.test(p),
      number: /\d/.test(p),
      special: /[^A-Za-z0-9]/.test(p),
      length: p.length >= 8,
    };
  });

  protected show(name: keyof typeof this.regForm.controls): boolean {
    const c = this.regForm.controls[name];
    return c.invalid && c.touched;
  }

  protected onRegister(): void {
    if (this.regForm.invalid) {
      this.regForm.markAllAsTouched();
      return;
    }
    const { confirmPassword: _, ...request } = this.regForm.getRawValue();
    this.loading.set(true);
    this.errorMessage.set('');
    this.auth.register({ ...request, email: request.email.trim(), username: request.username.trim() }).subscribe({
      next: () => {
        this.toast.success('Registration successful! Please log in.');
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(errorMessage(err, 'Registration failed. Please try again.'));
      },
    });
  }
}
