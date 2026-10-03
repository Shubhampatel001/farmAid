package com.farmaid.controller;

import com.farmaid.dto.AuthDtos.ChangePasswordRequest;
import com.farmaid.dto.AuthDtos.UpdateProfileRequest;
import com.farmaid.dto.AuthDtos.UserResponse;
import com.farmaid.security.AppUserPrincipal;
import com.farmaid.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping
	public List<UserResponse> listUsers() {
		return userService.findAll();
	}

	@GetMapping("/me")
	public UserResponse me(@AuthenticationPrincipal AppUserPrincipal me) {
		return userService.getProfile(me.id());
	}

	@PutMapping("/me")
	public UserResponse updateMe(@AuthenticationPrincipal AppUserPrincipal me, @Valid @RequestBody UpdateProfileRequest request) {
		return userService.updateProfile(me.id(), request);
	}

	@PutMapping("/me/password")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void changePassword(@AuthenticationPrincipal AppUserPrincipal me, @Valid @RequestBody ChangePasswordRequest request) {
		userService.changePassword(me.id(), request);
	}
}
