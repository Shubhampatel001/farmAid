import { Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { errorMessage } from '../../core/http';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  /** Set by authGuard when redirecting here. */
  readonly returnUrl = input<string>();

  protected readonly showPassword = signal(false);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly loginForm = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');
    this.auth.login(this.loginForm.getRawValue()).subscribe({
      next: (res) => {
        this.toast.success(`Welcome back, ${res.username}!`);
        const target = this.returnUrl()?.startsWith('/') ? this.returnUrl()! : this.auth.homeFor(res.role);
        this.router.navigateByUrl(target);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(errorMessage(err, 'Login failed. Please try again.'));
      },
    });
  }
}
