import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards';

const USER = { role: 'USER' };
const ADMIN = { role: 'ADMIN' };

export const routes: Routes = [
  // Public
  { path: '', title: '', loadComponent: () => import('./components/home-page/home-page.component').then((m) => m.HomePageComponent) },
  { path: 'about', title: 'About Us', loadComponent: () => import('./components/about-us/about-us.component').then((m) => m.AboutUsComponent) },
  { path: 'services', title: 'Services', loadComponent: () => import('./components/services/services.component').then((m) => m.ServicesComponent) },
  { path: 'contact', title: 'Support', loadComponent: () => import('./components/support/support.component').then((m) => m.SupportComponent) },
  { path: 'privacy', title: 'Privacy Policy', loadComponent: () => import('./components/privacy-policy/privacy-policy.component').then((m) => m.PrivacyPolicyComponent) },
  { path: 'terms', title: 'Terms of Service', loadComponent: () => import('./components/terms-of-service/terms-of-service.component').then((m) => m.TermsOfServiceComponent) },
  { path: 'loans', title: 'Loan Schemes', loadComponent: () => import('./components/userviewloan/userviewloan.component').then((m) => m.UserViewLoanComponent) },

  // Auth
  { path: 'login', title: 'Login', canActivate: [guestGuard], loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent) },
  { path: 'signup', title: 'Register', canActivate: [guestGuard], loadComponent: () => import('./components/signup/signup.component').then((m) => m.SignupComponent) },

  // Farmer
  {
    path: 'loans/:loanId/apply', title: 'Apply for Loan', canActivate: [authGuard], data: USER,
    loadComponent: () => import('./components/loanform/loanform.component').then((m) => m.LoanFormComponent),
  },
  {
    path: 'my/applications', title: 'My Applications', canActivate: [authGuard], data: USER,
    loadComponent: () => import('./components/userappliedloan/userappliedloan.component').then((m) => m.UserAppliedLoanComponent),
  },
  {
    path: 'my/feedback/new', title: 'Share Feedback', canActivate: [authGuard], data: USER,
    loadComponent: () => import('./components/useraddfeedback/useraddfeedback.component').then((m) => m.UserAddFeedbackComponent),
  },
  {
    path: 'my/feedback', title: 'My Feedback', canActivate: [authGuard], data: USER,
    loadComponent: () => import('./components/userviewfeedback/userviewfeedback.component').then((m) => m.UserViewFeedbackComponent),
  },

  // Admin
  {
    path: 'admin/loans', title: 'Manage Loans', canActivate: [authGuard], data: ADMIN,
    loadComponent: () => import('./components/viewloan/viewloan.component').then((m) => m.ViewLoanComponent),
  },
  {
    path: 'admin/loans/new', title: 'Create Loan', canActivate: [authGuard], data: ADMIN,
    loadComponent: () => import('./components/admineditloan/admineditloan.component').then((m) => m.LoanEditorComponent),
  },
  {
    path: 'admin/loans/:loanId/edit', title: 'Edit Loan', canActivate: [authGuard], data: ADMIN,
    loadComponent: () => import('./components/admineditloan/admineditloan.component').then((m) => m.LoanEditorComponent),
  },
  {
    path: 'admin/applications', title: 'Loan Applications', canActivate: [authGuard], data: ADMIN,
    loadComponent: () => import('./components/requestedloan/requestedloan.component').then((m) => m.RequestedLoanComponent),
  },
  {
    path: 'admin/feedback', title: 'All Feedback', canActivate: [authGuard], data: ADMIN,
    loadComponent: () => import('./components/adminviewfeedback/adminviewfeedback.component').then((m) => m.AdminViewFeedbackComponent),
  },

  { path: '**', title: 'Page Not Found', loadComponent: () => import('./components/error/error.component').then((m) => m.ErrorComponent) },
];
