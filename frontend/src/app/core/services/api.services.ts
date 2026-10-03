import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApplicationStatus,
  DecisionRequest,
  Feedback,
  FeedbackRequest,
  Loan,
  LoanApplication,
  LoanApplicationRequest,
  LoanRequest,
  User,
} from '../models';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class LoanService {
  private readonly http = inject(HttpClient);

  /** Active loans for everyone; admins also receive deactivated ones. */
  list(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${API}/loans`);
  }

  get(loanId: number): Observable<Loan> {
    return this.http.get<Loan>(`${API}/loans/${loanId}`);
  }

  create(loan: LoanRequest): Observable<Loan> {
    return this.http.post<Loan>(`${API}/loans`, loan);
  }

  update(loanId: number, loan: LoanRequest): Observable<Loan> {
    return this.http.put<Loan>(`${API}/loans/${loanId}`, loan);
  }

  setActive(loanId: number, active: boolean): Observable<Loan> {
    return this.http.patch<Loan>(`${API}/loans/${loanId}/status`, null, { params: { active } });
  }
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly http = inject(HttpClient);

  apply(request: LoanApplicationRequest): Observable<LoanApplication> {
    return this.http.post<LoanApplication>(`${API}/applications`, request);
  }

  mine(): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(`${API}/applications/me`);
  }

  all(status?: ApplicationStatus): Observable<LoanApplication[]> {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<LoanApplication[]>(`${API}/applications`, { params });
  }

  /** Includes the uploaded document. */
  get(id: number): Observable<LoanApplication> {
    return this.http.get<LoanApplication>(`${API}/applications/${id}`);
  }

  cancel(id: number): Observable<LoanApplication> {
    return this.http.patch<LoanApplication>(`${API}/applications/${id}/cancel`, null);
  }

  decide(id: number, decision: DecisionRequest): Observable<LoanApplication> {
    return this.http.patch<LoanApplication>(`${API}/applications/${id}/decision`, decision);
  }
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly http = inject(HttpClient);

  create(request: FeedbackRequest): Observable<Feedback> {
    return this.http.post<Feedback>(`${API}/feedback`, request);
  }

  mine(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${API}/feedback/me`);
  }

  all(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${API}/feedback`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/feedback/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly http = inject(HttpClient);

  states(): Observable<string[]> {
    return this.http.get<string[]>(`${API}/location/states`);
  }

  districts(state: string): Observable<string[]> {
    return this.http.get<string[]>(`${API}/location/districts`, { params: { state } });
  }
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  me(): Observable<User> {
    return this.http.get<User>(`${API}/users/me`);
  }
}
