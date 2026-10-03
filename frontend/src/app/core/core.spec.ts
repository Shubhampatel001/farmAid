import { HttpErrorResponse, provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './guards';
import { authInterceptor, errorMessage } from './http';
import { AuthResponse } from './models';
import { AuthService } from './services/auth.service';

function session(role: 'USER' | 'ADMIN', expiresInMs = 60_000): AuthResponse {
  return { token: 'tok', expiresAt: Date.now() + expiresInMs, userId: 1, username: 'Ravi', role };
}

describe('core', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function setup(stored?: AuthResponse) {
    if (stored) localStorage.setItem('farmaid.session', JSON.stringify(stored));
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    });
    return TestBed.inject(AuthService);
  }

  function runGuard(role?: string, url = '/my/applications') {
    const route = { data: role ? { role } : {} } as unknown as ActivatedRouteSnapshot;
    return TestBed.runInInjectionContext(() => authGuard(route, { url } as RouterStateSnapshot));
  }

  it('restores a valid session and ignores an expired one', () => {
    expect(setup(session('USER')).isUser()).toBe(true);
    TestBed.resetTestingModule();
    expect(setup(session('USER', -1)).isLoggedIn()).toBe(false);
  });

  it('guard redirects anonymous users to login with a return URL', () => {
    setup();
    const result = runGuard('USER') as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/login?returnUrl=%2Fmy%2Fapplications');
  });

  it('guard sends users with the wrong role to their home page', () => {
    setup(session('USER'));
    const result = runGuard('ADMIN') as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/loans');
    expect(runGuard('USER')).toBe(true);
  });

  it('interceptor attaches the bearer token to API calls only', () => {
    setup(session('ADMIN'));
    const http = TestBed.inject(HttpClient);
    const ctrl = TestBed.inject(HttpTestingController);
    http.get('/api/loans').subscribe();
    http.get('https://example.com/other').subscribe();
    expect(ctrl.expectOne('/api/loans').request.headers.get('Authorization')).toBe('Bearer tok');
    expect(ctrl.expectOne('https://example.com/other').request.headers.has('Authorization')).toBe(false);
  });

  it('errorMessage prefers field errors, then message, then a fallback', () => {
    const withFields = new HttpErrorResponse({ status: 400, error: { message: 'Validation failed', fieldErrors: { email: 'Invalid email format' } } });
    expect(errorMessage(withFields)).toBe('Invalid email format');
    expect(errorMessage(new HttpErrorResponse({ status: 409, error: { message: 'Already exists' } }))).toBe('Already exists');
    expect(errorMessage(new HttpErrorResponse({ status: 0 }))).toContain('Cannot reach the server');
    expect(errorMessage(new Error('x'), 'fallback')).toBe('fallback');
  });
});
