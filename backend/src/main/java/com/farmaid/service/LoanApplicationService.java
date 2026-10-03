package com.farmaid.service;

import com.farmaid.dto.ApplicationDtos.DecisionRequest;
import com.farmaid.dto.ApplicationDtos.LoanApplicationRequest;
import com.farmaid.dto.ApplicationDtos.LoanApplicationResponse;
import com.farmaid.exception.AppMessages;
import com.farmaid.exception.BadRequestException;
import com.farmaid.exception.ConflictException;
import com.farmaid.exception.ResourceNotFoundException;
import com.farmaid.mapper.Mappers;
import com.farmaid.model.ApplicationDocument;
import com.farmaid.model.ApplicationStatus;
import com.farmaid.model.Loan;
import com.farmaid.model.LoanApplication;
import com.farmaid.model.User;
import com.farmaid.repository.LoanApplicationRepository;
import com.farmaid.security.AppUserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class LoanApplicationService {

	private final LoanApplicationRepository applicationRepository;
	private final UserService userService;
	private final LoanService loanService;

	public LoanApplicationService(LoanApplicationRepository applicationRepository, UserService userService,
								  LoanService loanService) {
		this.applicationRepository = applicationRepository;
		this.userService = userService;
		this.loanService = loanService;
	}

	@Transactional
	public LoanApplicationResponse apply(Long userId, LoanApplicationRequest request) {
		User user = userService.find(userId);
		Loan loan = loanService.find(request.loanId());
		if (!loan.isActive()) {
			throw new BadRequestException(AppMessages.LOAN_INACTIVE);
		}
		if (request.requestedAmount() > loan.getMaximumAmount()) {
			throw new BadRequestException(String.format(AppMessages.AMOUNT_EXCEEDS_MAXIMUM, loan.getMaximumAmount()));
		}
		if (applicationRepository.existsByUserUserIdAndLoanLoanIdAndStatus(userId, loan.getLoanId(), ApplicationStatus.PENDING)) {
			throw new ConflictException(AppMessages.DUPLICATE_PENDING_APPLICATION);
		}

		LoanApplication app = new LoanApplication();
		app.setUser(user);
		app.setLoan(loan);
		app.setSubmissionDate(LocalDate.now());
		app.setStatus(ApplicationStatus.PENDING);
		app.setRequestedAmount(request.requestedAmount());
		app.setState(request.state());
		app.setDistrict(request.district());
		app.setFarmLocation(request.farmLocation().trim());
		app.setFarmerAddress(request.farmerAddress().trim());
		app.setFarmSizeInAcres(request.farmSizeInAcres());
		app.setFarmPurpose(request.farmPurpose().trim());
		app.setDocument(new ApplicationDocument(request.file()));
		return Mappers.toApplicationResponse(applicationRepository.save(app), false);
	}

	@Transactional(readOnly = true)
	public List<LoanApplicationResponse> listForUser(Long userId) {
		return applicationRepository.findByUserUserIdOrderBySubmissionDateDescLoanApplicationIdDesc(userId).stream()
				.map(a -> Mappers.toApplicationResponse(a, false))
				.toList();
	}

	@Transactional(readOnly = true)
	public List<LoanApplicationResponse> listAll(ApplicationStatus status) {
		List<LoanApplication> apps = status == null
				? applicationRepository.findAllByOrderBySubmissionDateDescLoanApplicationIdDesc()
				: applicationRepository.findByStatusOrderBySubmissionDateDescLoanApplicationIdDesc(status);
		return apps.stream().map(a -> Mappers.toApplicationResponse(a, false)).toList();
	}

	/** Full detail including the document. Owners see their own; admins see all. Others get 404, not 403, to avoid leaking ids. */
	@Transactional(readOnly = true)
	public LoanApplicationResponse get(Long applicationId, AppUserPrincipal caller) {
		LoanApplication app = find(applicationId);
		if (!caller.isAdmin() && !app.getUser().getUserId().equals(caller.id())) {
			throw new ResourceNotFoundException(AppMessages.LOAN_APPLICATION_NOT_FOUND);
		}
		return Mappers.toApplicationResponse(app, true);
	}

	@Transactional
	public LoanApplicationResponse cancel(Long applicationId, Long userId) {
		LoanApplication app = find(applicationId);
		if (!app.getUser().getUserId().equals(userId)) {
			throw new ResourceNotFoundException(AppMessages.LOAN_APPLICATION_NOT_FOUND);
		}
		if (app.getStatus() != ApplicationStatus.PENDING) {
			throw new ConflictException(AppMessages.ONLY_PENDING_CAN_BE_CANCELLED);
		}
		app.setStatus(ApplicationStatus.CANCELLED);
		return Mappers.toApplicationResponse(app, false);
	}

	@Transactional
	public LoanApplicationResponse decide(Long applicationId, DecisionRequest request) {
		ApplicationStatus decision = request.status();
		if (decision != ApplicationStatus.APPROVED && decision != ApplicationStatus.REJECTED) {
			throw new BadRequestException(AppMessages.INVALID_DECISION);
		}
		String remarks = request.remarks() == null ? null : request.remarks().trim();
		if (decision == ApplicationStatus.REJECTED && (remarks == null || remarks.isEmpty())) {
			throw new BadRequestException(AppMessages.REMARKS_REQUIRED_FOR_REJECTION);
		}
		LoanApplication app = find(applicationId);
		if (app.getStatus() != ApplicationStatus.PENDING) {
			throw new ConflictException(AppMessages.ONLY_PENDING_CAN_BE_DECIDED);
		}
		app.setStatus(decision);
		app.setAdminRemarks(remarks == null || remarks.isEmpty() ? null : remarks);
		return Mappers.toApplicationResponse(app, false);
	}

	private LoanApplication find(Long applicationId) {
		return applicationRepository.findById(applicationId)
				.orElseThrow(() -> new ResourceNotFoundException(AppMessages.LOAN_APPLICATION_NOT_FOUND));
	}
}
