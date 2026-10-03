package com.farmaid.repository;

import com.farmaid.model.Loan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {

	List<Loan> findByActiveTrueOrderByLoanTypeAsc();

	List<Loan> findAllByOrderByLoanTypeAsc();

	boolean existsByLoanTypeIgnoreCase(String loanType);

	boolean existsByLoanTypeIgnoreCaseAndLoanIdNot(String loanType, Long loanId);
}
