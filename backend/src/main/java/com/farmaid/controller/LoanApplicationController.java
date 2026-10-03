package com.farmaid.controller;

import com.farmaid.dto.ApplicationDtos.DecisionRequest;
import com.farmaid.dto.ApplicationDtos.LoanApplicationRequest;
import com.farmaid.dto.ApplicationDtos.LoanApplicationResponse;
import com.farmaid.model.ApplicationStatus;
import com.farmaid.security.AppUserPrincipal;
import com.farmaid.service.LoanApplicationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@Tag(name = "Loan applications")
public class LoanApplicationController {

	private final LoanApplicationService applicationService;

	public LoanApplicationController(LoanApplicationService applicationService) {
		this.applicationService = applicationService;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public LoanApplicationResponse apply(@AuthenticationPrincipal AppUserPrincipal me,
										 @Valid @RequestBody LoanApplicationRequest request) {
		return applicationService.apply(me.id(), request);
	}

	@GetMapping("/me")
	public List<LoanApplicationResponse> mine(@AuthenticationPrincipal AppUserPrincipal me) {
		return applicationService.listForUser(me.id());
	}

	@GetMapping
	public List<LoanApplicationResponse> all(@RequestParam(required = false) ApplicationStatus status) {
		return applicationService.listAll(status);
	}

	@GetMapping("/{applicationId}")
	public LoanApplicationResponse get(@PathVariable Long applicationId, @AuthenticationPrincipal AppUserPrincipal me) {
		return applicationService.get(applicationId, me);
	}

	@PatchMapping("/{applicationId}/cancel")
	public LoanApplicationResponse cancel(@PathVariable Long applicationId, @AuthenticationPrincipal AppUserPrincipal me) {
		return applicationService.cancel(applicationId, me.id());
	}

	@PatchMapping("/{applicationId}/decision")
	public LoanApplicationResponse decide(@PathVariable Long applicationId, @Valid @RequestBody DecisionRequest request) {
		return applicationService.decide(applicationId, request);
	}
}
