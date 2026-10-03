package com.farmaid.dto;

import com.farmaid.model.ApplicationStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public final class ApplicationDtos {

	private ApplicationDtos() {
	}

	/** Roughly 5 MB of binary once base64 encoded (4/3 overhead) plus the data URL prefix. */
	public static final int MAX_FILE_CHARS = 7_000_000;

	public record LoanApplicationRequest(
			@NotNull(message = "Loan is required") Long loanId,
			@Positive(message = "Requested amount must be positive") double requestedAmount,
			@NotBlank(message = "State is required") String state,
			@NotBlank(message = "District is required") String district,
			@NotBlank(message = "Farm location is required") @Size(max = 255) String farmLocation,
			@NotBlank(message = "Farmer address is required") @Size(max = 500) String farmerAddress,
			@Positive(message = "Farm size must be positive") double farmSizeInAcres,
			@NotBlank(message = "Farm purpose is required") @Size(max = 1000) String farmPurpose,
			@NotBlank(message = "Supporting document is required")
			@Size(max = MAX_FILE_CHARS, message = "Document must be smaller than 5 MB")
			@Pattern(regexp = "^data:(image/(png|jpe?g|webp)|application/pdf);base64,[A-Za-z0-9+/=\\s]+$",
					message = "Document must be a PNG, JPG, WEBP or PDF file") String file) {
	}

	public record DecisionRequest(
			@NotNull(message = "Status is required") ApplicationStatus status,
			@Size(max = 1000) String remarks) {
	}

	public record UserSummary(Long userId, String username, String email, String mobileNumber) {
	}

	public record LoanSummary(Long loanId, String loanType, double interestRate, double maximumAmount, int repaymentTenure) {
	}

	/** {@code file} is only populated on the single-application endpoint to keep list payloads small. */
	@JsonInclude(JsonInclude.Include.NON_NULL)
	public record LoanApplicationResponse(
			Long loanApplicationId,
			LocalDate submissionDate,
			ApplicationStatus status,
			double requestedAmount,
			String state,
			String district,
			String farmLocation,
			String farmerAddress,
			double farmSizeInAcres,
			String farmPurpose,
			String adminRemarks,
			String file,
			UserSummary user,
			LoanSummary loan) {
	}
}
