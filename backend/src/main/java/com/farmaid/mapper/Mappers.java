package com.farmaid.mapper;

import com.farmaid.dto.ApplicationDtos.LoanApplicationResponse;
import com.farmaid.dto.ApplicationDtos.LoanSummary;
import com.farmaid.dto.ApplicationDtos.UserSummary;
import com.farmaid.dto.AuthDtos.UserResponse;
import com.farmaid.dto.FeedbackDtos.FeedbackResponse;
import com.farmaid.dto.LoanDtos.LoanRequest;
import com.farmaid.dto.LoanDtos.LoanResponse;
import com.farmaid.model.Feedback;
import com.farmaid.model.Loan;
import com.farmaid.model.LoanApplication;
import com.farmaid.model.User;

/** Entity to DTO conversion. Entities never leave the service layer. */
public final class Mappers {

	private Mappers() {
	}

	public static UserResponse toUserResponse(User user) {
		return new UserResponse(user.getUserId(), user.getEmail(), user.getUsername(), user.getMobileNumber(), user.getRole());
	}

	public static LoanResponse toLoanResponse(Loan loan) {
		return new LoanResponse(loan.getLoanId(), loan.getLoanType(), loan.getDescription(), loan.getInterestRate(),
				loan.getMaximumAmount(), loan.getRepaymentTenure(), loan.getEligibility(), loan.getDocumentsRequired(),
				loan.isActive());
	}

	/** Copies request fields onto an existing entity so that id and active flag are preserved on update. */
	public static void applyLoanRequest(LoanRequest request, Loan loan) {
		loan.setLoanType(request.loanType().trim());
		loan.setDescription(request.description());
		loan.setInterestRate(request.interestRate());
		loan.setMaximumAmount(request.maximumAmount());
		loan.setRepaymentTenure(request.repaymentTenure());
		loan.setEligibility(request.eligibility());
		loan.setDocumentsRequired(request.documentsRequired());
	}

	public static LoanApplicationResponse toApplicationResponse(LoanApplication app, boolean includeFile) {
		User user = app.getUser();
		Loan loan = app.getLoan();
		return new LoanApplicationResponse(
				app.getLoanApplicationId(),
				app.getSubmissionDate(),
				app.getStatus(),
				app.getRequestedAmount(),
				app.getState(),
				app.getDistrict(),
				app.getFarmLocation(),
				app.getFarmerAddress(),
				app.getFarmSizeInAcres(),
				app.getFarmPurpose(),
				app.getAdminRemarks(),
				includeFile && app.getDocument() != null ? app.getDocument().getData() : null,
				new UserSummary(user.getUserId(), user.getUsername(), user.getEmail(), user.getMobileNumber()),
				new LoanSummary(loan.getLoanId(), loan.getLoanType(), loan.getInterestRate(), loan.getMaximumAmount(),
						loan.getRepaymentTenure()));
	}

	public static FeedbackResponse toFeedbackResponse(Feedback feedback) {
		return new FeedbackResponse(feedback.getFeedbackId(), feedback.getFeedbackText(), feedback.getRating(),
				feedback.getDate(), feedback.getUser().getUserId(), feedback.getUser().getUsername());
	}
}
