import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, Role, User } from '../models';

const STORAGE_KEY = 'farmaid.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
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

  /** Where a user lands after login. */
  homeFor(role: Role | null): string {
    return role === 'ADMIN' ? '/admin/applications' : role === 'USER' ? '/loans' : '/';
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
