package com.farmaid.controller;

import com.farmaid.dto.FeedbackDtos.FeedbackRequest;
import com.farmaid.dto.FeedbackDtos.FeedbackResponse;
import com.farmaid.security.AppUserPrincipal;
import com.farmaid.service.FeedbackService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@Tag(name = "Feedback")
public class FeedbackController {

	private final FeedbackService feedbackService;

	public FeedbackController(FeedbackService feedbackService) {
		this.feedbackService = feedbackService;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public FeedbackResponse create(@AuthenticationPrincipal AppUserPrincipal me, @Valid @RequestBody FeedbackRequest request) {
		return feedbackService.create(me.id(), request);
	}

	@GetMapping("/me")
	public List<FeedbackResponse> mine(@AuthenticationPrincipal AppUserPrincipal me) {
		return feedbackService.listForUser(me.id());
	}

	@GetMapping
	public List<FeedbackResponse> all() {
		return feedbackService.listAll();
	}

	@DeleteMapping("/{feedbackId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable Long feedbackId, @AuthenticationPrincipal AppUserPrincipal me) {
		feedbackService.delete(feedbackId, me.id());
	}
}
