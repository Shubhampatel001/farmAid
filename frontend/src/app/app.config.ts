import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, TitleStrategy, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor, sessionExpiryInterceptor } from './core/http';
import { AuthService } from './core/services/auth.service';
import { FarmAidTitleStrategy } from './core/title-strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(withInterceptors([authInterceptor, sessionExpiryInterceptor])),
    { provide: TitleStrategy, useClass: FarmAidTitleStrategy },
    // Fire-and-forget: the check runs in the background so the first render is never blocked.
    provideAppInitializer(() => inject(AuthService).validateSession()),
  ],
};
