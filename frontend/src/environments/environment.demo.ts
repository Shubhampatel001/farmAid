import { DemoAccount } from './demo-account';

// Public demo build (`ng build --configuration demo`), served by the backend's "demo" profile.
// These accounts are created by DemoDataSeeder/AdminSeeder and reset on every restart.
export const environment = {
  production: true,
  apiUrl: '/api',
  demoAccounts: [
    { label: 'Admin', email: 'admin@farmaid.demo', password: 'Admin@123', note: 'Manage loans, review applications' },
    { label: 'Farmer – Ravi', email: 'ravi@farmaid.demo', password: 'Farmer@123', note: '1 pending, 1 approved' },
    { label: 'Farmer – Priya', email: 'priya@farmaid.demo', password: 'Farmer@123', note: '1 rejected, 1 pending' },
  ] as DemoAccount[],
};
