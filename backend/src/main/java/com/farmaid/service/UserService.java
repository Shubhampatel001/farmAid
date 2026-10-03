package com.farmaid.service;

import com.farmaid.dto.AuthDtos.ChangePasswordRequest;
import com.farmaid.dto.AuthDtos.UpdateProfileRequest;
import com.farmaid.dto.AuthDtos.UserResponse;
import com.farmaid.exception.AppMessages;
import com.farmaid.exception.BadRequestException;
import com.farmaid.exception.ResourceNotFoundException;
import com.farmaid.mapper.Mappers;
import com.farmaid.model.User;
import com.farmaid.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Transactional(readOnly = true)
	public List<UserResponse> findAll() {
		return userRepository.findAll(Sort.by("userId")).stream().map(Mappers::toUserResponse).toList();
	}

	@Transactional(readOnly = true)
	public UserResponse getProfile(Long userId) {
		return Mappers.toUserResponse(find(userId));
	}

	@Transactional
	public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
		User user = find(userId);
		user.setUsername(request.username().trim());
		user.setMobileNumber(request.mobileNumber());
		return Mappers.toUserResponse(user);
	}

	@Transactional
	public void changePassword(Long userId, ChangePasswordRequest request) {
		User user = find(userId);
		if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
			throw new BadRequestException(AppMessages.WRONG_CURRENT_PASSWORD);
		}
		user.setPassword(passwordEncoder.encode(request.newPassword()));
	}

	User find(Long userId) {
		return userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException(AppMessages.USER_NOT_FOUND));
	}
}
