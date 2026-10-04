export interface DemoAccount {
  name: string;
  role: 'Admin' | 'Farmer';
  email: string;
  password: string;
  note: string;
}
