import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SKIP_SESSION_REDIRECT } from '../http-context';
import { AuthResponse, LoginRequest, RegisterRequest, Role, User } from '../models';
import { ToastService } from './toast.service';

const STORAGE_KEY = 'farmaid.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly url = `${environment.apiUrl}/auth`;

  private readonly session = signal<AuthResponse | null>(readSession());

  readonly currentUser = this.session.asReadonly();
  readonly isLoggedIn = computed(() => {
    const s = this.session();
    return !!s && s.expiresAt > Date.now();
  });
  readonly role = computed<Role | null>(() => (this.isLoggedIn() ? this.session()!.role : null));
  readonly isAdmin = computed(() => this.role() === 'ADMIN');
  readonly isUser = computed(() => this.role() === 'USER');

  get token(): string | null {
    return this.isLoggedIn() ? this.session()!.token : null;
  }

  register(request: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.url}/register`, request);
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/login`, request).pipe(tap((res) => this.store(res)));
  }

  logout(redirectTo = '/login'): void {
    this.store(null);
    this.router.navigateByUrl(redirectTo);
  }

  /**
   * Called once at startup (see app.config.ts). A saved login can outlive the server-side session,
   * e.g. after the demo restarts, so ask the API who we are without blocking the first render:
   * - accepted: refresh the stored name and role;
   * - 401: drop the login quietly, and send the user to /login only if they are on a protected page;
   * - network error or server still waking up: keep the login.
   * The reply only applies if the same login is still active (the user may have switched accounts meanwhile).
   */
  validateSession(): void {
    if (!this.isLoggedIn()) return;
    const token = this.session()!.token;
    const context = new HttpContext().set(SKIP_SESSION_REDIRECT, true);
    this.http.get<User>(`${environment.apiUrl}/users/me`, { context }).subscribe({
      next: (user) => {
        const current = this.session();
        if (current?.token === token) this.store({ ...current, username: user.username, role: user.role });
      },
      error: (err: unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 401) this.endStaleSession(token, false);
      },
    });
  }

  /**
   * Clears a login the server no longer accepts. Several requests can fail at once (e.g. the startup
   * check and the page's own data request), so only the first call clears the session and shows a message.
   * @param failedToken the token the rejected request was sent with; ignored if a different login is now active.
   * @param alwaysGoToLogin true when a page's own request failed; false sends to /login only from protected pages.
   */
  endStaleSession(failedToken: string, alwaysGoToLogin: boolean): void {
    if (this.session()?.token !== failedToken) return;
    this.store(null);
    this.toast.info('Your session has ended. Please log in again.');
    if (alwaysGoToLogin || this.onProtectedPage()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
    }
  }

  /** Where a user lands after login. */
  homeFor(role: Role | null): string {
    return role === 'ADMIN' ? '/admin/applications' : role === 'USER' ? '/loans' : '/';
  }

  /** Protected routes are the ones that declare a required role (see app.routes.ts). */
  private onProtectedPage(): boolean {
    let route: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
    while (route) {
      if (route.data?.['role']) return true;
      route = route.firstChild;
    }
    return false;
  }

  private store(session: AuthResponse | null): void {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Storage unavailable (private mode): keep the session in memory only.
    }
    this.session.set(session);
  }
}

function readSession(): AuthResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthResponse;
    return parsed.expiresAt > Date.now() ? parsed : null;
  } catch {
    return null;
  }
}
