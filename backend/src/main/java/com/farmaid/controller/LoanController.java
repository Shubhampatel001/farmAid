package com.farmaid.controller;

import com.farmaid.dto.LoanDtos.LoanRequest;
import com.farmaid.dto.LoanDtos.LoanResponse;
import com.farmaid.security.AppUserPrincipal;
import com.farmaid.service.LoanService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
@Tag(name = "Loans")
public class LoanController {

	private final LoanService loanService;

	public LoanController(LoanService loanService) {
		this.loanService = loanService;
	}

	/** Public catalogue of active loans; admins also see deactivated ones. */
	@GetMapping
	public List<LoanResponse> list(@AuthenticationPrincipal AppUserPrincipal caller) {
		return loanService.list(isAdmin(caller));
	}

	@GetMapping("/{loanId}")
	public LoanResponse get(@PathVariable Long loanId, @AuthenticationPrincipal AppUserPrincipal caller) {
		return loanService.get(loanId, isAdmin(caller));
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public LoanResponse create(@Valid @RequestBody LoanRequest request) {
		return loanService.create(request);
	}

	@PutMapping("/{loanId}")
	public LoanResponse update(@PathVariable Long loanId, @Valid @RequestBody LoanRequest request) {
		return loanService.update(loanId, request);
	}

	@PatchMapping("/{loanId}/status")
	public LoanResponse setActive(@PathVariable Long loanId, @RequestParam boolean active) {
		return loanService.setActive(loanId, active);
	}

	private static boolean isAdmin(AppUserPrincipal caller) {
		return caller != null && caller.isAdmin();
	}
}
