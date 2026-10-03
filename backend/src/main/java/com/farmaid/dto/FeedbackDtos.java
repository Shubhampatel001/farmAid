package com.farmaid.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public final class FeedbackDtos {

	private FeedbackDtos() {
	}

	public record FeedbackRequest(
			@NotBlank(message = "Kindly provide your feedback") @Size(max = 2000) String feedbackText,
			@Min(value = 1, message = "Rating must be between 1 and 5") @Max(value = 5, message = "Rating must be between 1 and 5") int rating) {
	}

	public record FeedbackResponse(Long feedbackId, String feedbackText, int rating, LocalDate date, Long userId, String username) {
	}
}
