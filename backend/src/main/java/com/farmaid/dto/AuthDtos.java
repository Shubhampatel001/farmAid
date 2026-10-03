package com.farmaid.dto;

import com.farmaid.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

	private AuthDtos() {
	}

	public static final String PASSWORD_RULE = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,64}$";
	public static final String PASSWORD_MESSAGE =
			"Password must be 8-64 characters with upper and lower case letters, a number and a special character";

	/** Self-registration always creates a USER; there is deliberately no role field. */
	public record RegisterRequest(
			@NotBlank(message = "Email is required") @Email(message = "Invalid email format") String email,
			@NotBlank(message = "Password is required") @Pattern(regexp = PASSWORD_RULE, message = PASSWORD_MESSAGE) String password,
			@NotBlank(message = "Username is required") @Size(max = 100) String username,
			@NotBlank(message = "Mobile number is required")
			@Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must be 10 digits") String mobileNumber) {

		@Override
		public String toString() {
			return "RegisterRequest[email=" + email + ", username=" + username + "]";
		}
	}

	public record LoginRequest(
			@NotBlank(message = "Email is required") @Email(message = "Invalid email format") String email,
			@NotBlank(message = "Password is required") String password) {

		@Override
		public String toString() {
			return "LoginRequest[email=" + email + "]";
		}
	}

	public record AuthResponse(String token, long expiresAt, Long userId, String username, Role role) {
	}

	public record UserResponse(Long userId, String email, String username, String mobileNumber, Role role) {
	}

	public record UpdateProfileRequest(
			@NotBlank(message = "Username is required") @Size(max = 100) String username,
			@NotBlank(message = "Mobile number is required")
			@Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must be 10 digits") String mobileNumber) {
	}

	public record ChangePasswordRequest(
			@NotBlank(message = "Current password is required") String currentPassword,
			@NotBlank(message = "New password is required") @Pattern(regexp = PASSWORD_RULE, message = PASSWORD_MESSAGE) String newPassword) {

		@Override
		public String toString() {
			return "ChangePasswordRequest[***]";
		}
	}
}
