import { signal } from '@angular/core';
import { Loan } from '../core/models';
import { calculateEmi } from './emi';
import { filterAndSortLoans } from './loan-table';
import { createPager } from './pagination';
import { emojiFor } from './ratings';

describe('calculateEmi', () => {
  it('matches the standard reducing-balance formula', () => {
    const r = calculateEmi(100000, 12, 12)!;
    expect(r.emi).toBeCloseTo(8884.88, 2);
    expect(r.total).toBeCloseTo(106618.55, 1);
  });

  it('handles a zero interest rate', () => {
    expect(calculateEmi(1200, 0, 12)!.emi).toBe(100);
  });

  it('rejects invalid input', () => {
    expect(calculateEmi(0, 10, 12)).toBeNull();
    expect(calculateEmi(1000, 10, 0)).toBeNull();
    expect(calculateEmi(Number.NaN, 10, 12)).toBeNull();
  });
});

describe('filterAndSortLoans', () => {
  const loan = (loanId: number, loanType: string, maximumAmount: number): Loan => ({
    loanId, loanType, maximumAmount, description: 'd', interestRate: 7, repaymentTenure: 12,
    eligibility: 'farmers', documentsRequired: 'aadhaar', active: true,
  });
  const loans = [loan(1, 'Tractor', 500000), loan(2, 'Crop', 100000), loan(3, 'Dairy', 300000)];

  it('searches case-insensitively across fields', () => {
    expect(filterAndSortLoans(loans, 'crop', 'loanType', 'asc').map((l) => l.loanId)).toEqual([2]);
  });

  it('sorts numbers numerically and strings alphabetically', () => {
    expect(filterAndSortLoans(loans, '', 'maximumAmount', 'desc').map((l) => l.loanId)).toEqual([1, 3, 2]);
    expect(filterAndSortLoans(loans, '', 'loanType', 'asc').map((l) => l.loanType)).toEqual(['Crop', 'Dairy', 'Tractor']);
  });
});

describe('createPager', () => {
  it('slices pages and resets to page 1 when the source changes', () => {
    const source = signal([1, 2, 3, 4, 5, 6, 7]);
    const pager = createPager(source, 3);
    expect(pager.totalPages()).toBe(3);
    pager.page.set(3);
    expect(pager.items()).toEqual([7]);
    source.set([1, 2]);
    expect(pager.page()).toBe(1);
    expect(pager.totalPages()).toBe(1);
  });
});

describe('emojiFor', () => {
  it('maps ratings 1..5 and falls back for unknown values', () => {
    expect(emojiFor(5)).toBe('😍');
    expect(emojiFor(9)).toBe('❔');
  });
});
