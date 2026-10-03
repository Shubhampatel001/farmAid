import { Loan } from '../core/models';

export type LoanSortKey = 'loanType' | 'maximumAmount' | 'interestRate' | 'repaymentTenure' | 'eligibility';

/** Shared search + sort used by the admin and farmer loan tables. */
export function filterAndSortLoans(loans: Loan[], keyword: string, key: LoanSortKey, order: 'asc' | 'desc'): Loan[] {
  const term = keyword.trim().toLowerCase();
  const filtered = term
    ? loans.filter((l) =>
        [l.loanType, l.description, l.eligibility, l.documentsRequired, l.maximumAmount, l.interestRate, l.repaymentTenure]
          .some((v) => String(v).toLowerCase().includes(term)),
      )
    : loans;
  const dir = order === 'asc' ? 1 : -1;
  return [...filtered].sort((a, b) => {
    const x = a[key];
    const y = b[key];
    return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * dir;
  });
}
