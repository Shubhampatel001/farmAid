import { HttpErrorResponse, provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './guards';
import { authInterceptor, errorMessage, sessionExpiryInterceptor } from './http';
import { AuthResponse } from './models';
import { AuthService } from './services/auth.service';
import { ToastService } from './services/toast.service';

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

  describe('validateSession (startup check)', () => {
    @Component({ template: '' })
    class Blank {}

    async function start(url: string) {
      localStorage.setItem('farmaid.session', JSON.stringify(session('USER')));
      TestBed.configureTestingModule({
        providers: [
          provideRouter([
            { path: '', component: Blank },
            { path: 'login', component: Blank },
            { path: 'my/applications', component: Blank, canActivate: [authGuard], data: { role: 'USER' } },
          ]),
          provideHttpClient(withInterceptors([authInterceptor, sessionExpiryInterceptor])),
          provideHttpClientTesting(),
        ],
      });
      const router = TestBed.inject(Router);
      await router.navigateByUrl(url);
      const auth = TestBed.inject(AuthService);
      auth.validateSession();
      const req = TestBed.inject(HttpTestingController).expectOne('/api/users/me');
      return { auth, router, req };
    }

    it('keeps a valid login and refreshes name and role', async () => {
      const { auth, req } = await start('/');
      req.flush({ userId: 1, email: 'r@x.in', username: 'Ravi Kumar', mobileNumber: '9876543210', role: 'USER' });
      expect(auth.isLoggedIn()).toBe(true);
      expect(auth.currentUser()?.username).toBe('Ravi Kumar');
    });

    it('drops a rejected login on a public page without redirecting', async () => {
      const { auth, router, req } = await start('/');
      req.flush({ message: 'Authentication required' }, { status: 401, statusText: 'Unauthorized' });
      await new Promise((r) => setTimeout(r));
      expect(auth.isLoggedIn()).toBe(false);
      expect(router.url).toBe('/');
      expect(localStorage.getItem('farmaid.session')).toBeNull();
    });

    it('sends the user to login when the rejected login was on a protected page', async () => {
      const { auth, router, req } = await start('/my/applications');
      req.flush({ message: 'Authentication required' }, { status: 401, statusText: 'Unauthorized' });
      await new Promise((r) => setTimeout(r));
      expect(auth.isLoggedIn()).toBe(false);
      expect(router.url).toBe('/login?returnUrl=%2Fmy%2Fapplications');
    });

    it('shows a single message when the page request and the startup check both fail', async () => {
      const { auth, router, req } = await start('/my/applications');
      let pageErrored = false;
      TestBed.inject(HttpClient).get('/api/applications/me').subscribe({ error: () => (pageErrored = true) });
      const ctrl = TestBed.inject(HttpTestingController);
      ctrl.expectOne('/api/applications/me').flush({}, { status: 401, statusText: 'Unauthorized' });
      req.flush({}, { status: 401, statusText: 'Unauthorized' });
      await new Promise((r) => setTimeout(r));
      expect(TestBed.inject(ToastService).toasts().length).toBe(1);
      expect(pageErrored).toBe(false);
      expect(auth.isLoggedIn()).toBe(false);
      expect(router.url).toBe('/login?returnUrl=%2Fmy%2Fapplications');
    });

    it('keeps the login when the server cannot be reached', async () => {
      const { auth, req } = await start('/');
      req.error(new ProgressEvent('error'), { status: 0 });
      expect(auth.isLoggedIn()).toBe(true);
    });
  });

  it('errorMessage prefers field errors, then message, then a fallback', () => {
    const withFields = new HttpErrorResponse({ status: 400, error: { message: 'Validation failed', fieldErrors: { email: 'Invalid email format' } } });
    expect(errorMessage(withFields)).toBe('Invalid email format');
    expect(errorMessage(new HttpErrorResponse({ status: 409, error: { message: 'Already exists' } }))).toBe('Already exists');
    expect(errorMessage(new HttpErrorResponse({ status: 0 }))).toContain('Cannot reach the server');
    expect(errorMessage(new Error('x'), 'fallback')).toBe('fallback');
  });
});
