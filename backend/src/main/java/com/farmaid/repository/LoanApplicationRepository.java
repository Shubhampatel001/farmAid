package com.farmaid.repository;

import com.farmaid.model.ApplicationStatus;
import com.farmaid.model.LoanApplication;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanApplicationRepository extends JpaRepository<LoanApplication, Long> {

	@EntityGraph(attributePaths = {"user", "loan"})
	List<LoanApplication> findByUserUserIdOrderBySubmissionDateDescLoanApplicationIdDesc(Long userId);

	@EntityGraph(attributePaths = {"user", "loan"})
	List<LoanApplication> findAllByOrderBySubmissionDateDescLoanApplicationIdDesc();

	@EntityGraph(attributePaths = {"user", "loan"})
	List<LoanApplication> findByStatusOrderBySubmissionDateDescLoanApplicationIdDesc(ApplicationStatus status);

	boolean existsByUserUserIdAndLoanLoanIdAndStatus(Long userId, Long loanId, ApplicationStatus status);
}
