package com.farmaid.exception;

public final class AppMessages {

	private AppMessages() {
	}

	public static final String USER_NOT_FOUND = "User does not exist.";
	public static final String LOAN_NOT_FOUND = "Loan does not exist.";
	public static final String FEEDBACK_NOT_FOUND = "Feedback does not exist.";
	public static final String LOAN_APPLICATION_NOT_FOUND = "Loan application not found.";
	public static final String USER_ALREADY_EXISTS = "An account with this email already exists.";
	public static final String LOAN_TYPE_EXISTS = "A loan with this type already exists.";
	public static final String INVALID_CREDENTIALS = "Invalid email or password.";
	public static final String WRONG_CURRENT_PASSWORD = "Current password is incorrect.";
	public static final String LOAN_INACTIVE = "This loan scheme is not accepting applications.";
	public static final String AMOUNT_EXCEEDS_MAXIMUM = "Requested amount exceeds the maximum of %.0f for this loan.";
	public static final String DUPLICATE_PENDING_APPLICATION = "You already have a pending application for this loan.";
	public static final String ONLY_PENDING_CAN_BE_CANCELLED = "Only pending applications can be cancelled.";
	public static final String ONLY_PENDING_CAN_BE_DECIDED = "Only pending applications can be approved or rejected.";
	public static final String INVALID_DECISION = "Decision must be APPROVED or REJECTED.";
	public static final String REMARKS_REQUIRED_FOR_REJECTION = "Please provide remarks when rejecting an application.";
}
