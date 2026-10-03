package com.farmaid.service;

import com.farmaid.dto.AuthDtos.AuthResponse;
import com.farmaid.dto.AuthDtos.LoginRequest;
import com.farmaid.dto.AuthDtos.RegisterRequest;
import com.farmaid.dto.AuthDtos.UserResponse;
import com.farmaid.exception.AppMessages;
import com.farmaid.exception.ConflictException;
import com.farmaid.mapper.Mappers;
import com.farmaid.model.Role;
import com.farmaid.model.User;
import com.farmaid.repository.UserRepository;
import com.farmaid.security.AppUserPrincipal;
import com.farmaid.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;

	public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
					   AuthenticationManager authenticationManager, JwtService jwtService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.authenticationManager = authenticationManager;
		this.jwtService = jwtService;
	}

	@Transactional
	public UserResponse register(RegisterRequest request) {
		String email = request.email().trim().toLowerCase();
		if (userRepository.existsByEmailIgnoreCase(email)) {
			throw new ConflictException(AppMessages.USER_ALREADY_EXISTS);
		}
		User user = new User();
		user.setEmail(email);
		user.setPassword(passwordEncoder.encode(request.password()));
		user.setUsername(request.username().trim());
		user.setMobileNumber(request.mobileNumber());
		user.setRole(Role.USER);
		return Mappers.toUserResponse(userRepository.save(user));
	}

	/** Throws BadCredentialsException (mapped to 401) on failure. */
	@Transactional(readOnly = true)
	public AuthResponse login(LoginRequest request) {
		var authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(request.email().trim(), request.password()));
		AppUserPrincipal principal = (AppUserPrincipal) authentication.getPrincipal();
		User user = userRepository.getReferenceById(principal.id());
		JwtService.IssuedToken token = jwtService.issue(principal);
		return new AuthResponse(token.token(), token.expiresAt().toEpochMilli(), principal.id(), user.getUsername(),
				principal.role());
	}
}
