import { DemoAccount } from './demo-account';

// Development: requests to /api are proxied to http://localhost:8080 (see proxy.conf.json).
export const environment = {
  production: false,
  apiUrl: '/api',
  demoAccounts: [] as DemoAccount[],
};
