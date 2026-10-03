// Mirrors the backend DTOs in com.farmaid.dto.

export type Role = 'USER' | 'ADMIN';

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export const APPLICATION_STATUSES: ApplicationStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

export interface AuthResponse {
  token: string;
  expiresAt: number;
  userId: number;
  username: string;
  role: Role;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  mobileNumber: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  userId: number;
  email: string;
  username: string;
  mobileNumber: string;
  role: Role;
}

export interface LoanRequest {
  loanType: string;
  description: string;
  interestRate: number;
  maximumAmount: number;
  repaymentTenure: number;
  eligibility: string;
  documentsRequired: string;
}

export interface Loan extends LoanRequest {
  loanId: number;
  active: boolean;
}

export interface LoanApplicationRequest {
  loanId: number;
  requestedAmount: number;
  state: string;
  district: string;
  farmLocation: string;
  farmerAddress: string;
  farmSizeInAcres: number;
  farmPurpose: string;
  /** base64 data URL */
  file: string;
}

export interface LoanApplication {
  loanApplicationId: number;
  submissionDate: string;
  status: ApplicationStatus;
  requestedAmount: number;
  state: string;
  district: string;
  farmLocation: string;
  farmerAddress: string;
  farmSizeInAcres: number;
  farmPurpose: string;
  adminRemarks?: string;
  /** Only present on GET /applications/{id}. */
  file?: string;
  user: { userId: number; username: string; email: string; mobileNumber: string };
  loan: { loanId: number; loanType: string; interestRate: number; maximumAmount: number; repaymentTenure: number };
}

export interface DecisionRequest {
  status: 'APPROVED' | 'REJECTED';
  remarks?: string;
}

export interface FeedbackRequest {
  feedbackText: string;
  rating: number;
}

export interface Feedback {
  feedbackId: number;
  feedbackText: string;
  rating: number;
  date: string;
  userId: number;
  username: string;
}

export interface ApiError {
  timestamp?: string;
  status: number;
  error?: string;
  message: string;
  path?: string;
  fieldErrors?: Record<string, string>;
}
