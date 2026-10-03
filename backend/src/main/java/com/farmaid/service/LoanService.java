package com.farmaid.service;

import com.farmaid.dto.LoanDtos.LoanRequest;
import com.farmaid.dto.LoanDtos.LoanResponse;
import com.farmaid.exception.AppMessages;
import com.farmaid.exception.ConflictException;
import com.farmaid.exception.ResourceNotFoundException;
import com.farmaid.mapper.Mappers;
import com.farmaid.model.Loan;
import com.farmaid.repository.LoanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LoanService {

	private final LoanRepository loanRepository;

	public LoanService(LoanRepository loanRepository) {
		this.loanRepository = loanRepository;
	}

	@Transactional(readOnly = true)
	public List<LoanResponse> list(boolean includeInactive) {
		List<Loan> loans = includeInactive
				? loanRepository.findAllByOrderByLoanTypeAsc()
				: loanRepository.findByActiveTrueOrderByLoanTypeAsc();
		return loans.stream().map(Mappers::toLoanResponse).toList();
	}

	/** Inactive loans are only visible to admins. */
	@Transactional(readOnly = true)
	public LoanResponse get(Long loanId, boolean includeInactive) {
		Loan loan = find(loanId);
		if (!loan.isActive() && !includeInactive) {
			throw new ResourceNotFoundException(AppMessages.LOAN_NOT_FOUND);
		}
		return Mappers.toLoanResponse(loan);
	}

	@Transactional
	public LoanResponse create(LoanRequest request) {
		if (loanRepository.existsByLoanTypeIgnoreCase(request.loanType().trim())) {
			throw new ConflictException(AppMessages.LOAN_TYPE_EXISTS);
		}
		Loan loan = new Loan();
		Mappers.applyLoanRequest(request, loan);
		return Mappers.toLoanResponse(loanRepository.save(loan));
	}

	@Transactional
	public LoanResponse update(Long loanId, LoanRequest request) {
		Loan loan = find(loanId);
		if (loanRepository.existsByLoanTypeIgnoreCaseAndLoanIdNot(request.loanType().trim(), loanId)) {
			throw new ConflictException(AppMessages.LOAN_TYPE_EXISTS);
		}
		Mappers.applyLoanRequest(request, loan);
		return Mappers.toLoanResponse(loan);
	}

	/** Soft delete / reactivate. Loans are never hard-deleted because applications reference them. */
	@Transactional
	public LoanResponse setActive(Long loanId, boolean active) {
		Loan loan = find(loanId);
		loan.setActive(active);
		return Mappers.toLoanResponse(loan);
	}

	Loan find(Long loanId) {
		return loanRepository.findById(loanId).orElseThrow(() -> new ResourceNotFoundException(AppMessages.LOAN_NOT_FOUND));
	}
}
