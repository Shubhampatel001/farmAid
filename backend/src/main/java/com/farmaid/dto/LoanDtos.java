package com.farmaid.dto;

import jakarta.validation.constraints.*;

public final class LoanDtos {

	private LoanDtos() {
	}

	public record LoanRequest(
			@NotBlank(message = "Loan type is required") @Size(max = 255) String loanType,
			@NotBlank(message = "Description is required") @Size(max = 2000) String description,
			@Positive(message = "Interest rate must be positive") @Max(value = 100, message = "Interest rate cannot exceed 100") double interestRate,
			@Positive(message = "Maximum amount must be positive") double maximumAmount,
			@Positive(message = "Repayment tenure must be positive") @Max(value = 360, message = "Repayment tenure cannot exceed 360 months") int repaymentTenure,
			@NotBlank(message = "Eligibility is required") @Size(max = 1000) String eligibility,
			@NotBlank(message = "Documents required is required") @Size(max = 1000) String documentsRequired) {
	}

	public record LoanResponse(
			Long loanId,
			String loanType,
			String description,
			double interestRate,
			double maximumAmount,
			int repaymentTenure,
			String eligibility,
			String documentsRequired,
			boolean active) {
	}
}
