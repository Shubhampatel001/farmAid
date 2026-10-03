import { DemoAccount } from './demo-account';

// Production: keep '/api' when the host proxies /api to the backend (nginx, Netlify/Vercel rewrites),
// or set the full backend URL, e.g. 'https://api.farmaid.example/api'.
export const environment = {
  production: true,
  apiUrl: '/api',
  demoAccounts: [] as DemoAccount[],
};
