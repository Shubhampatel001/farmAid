import { HttpContextToken } from '@angular/common/http';

/**
 * Set on requests that handle a 401 themselves, so the global session-expiry interceptor
 * does not show its own toast and redirect to /login (used by the startup session check).
 */
export const SKIP_SESSION_REDIRECT = new HttpContextToken<boolean>(() => false);
