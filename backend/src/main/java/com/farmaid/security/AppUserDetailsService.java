package com.farmaid.security;

import com.farmaid.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AppUserDetailsService implements UserDetailsService {

	private final UserRepository userRepository;

	public AppUserDetailsService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	public AppUserPrincipal loadUserByUsername(String email) {
		return userRepository.findByEmailIgnoreCase(email)
				.map(AppUserPrincipal::from)
				.orElseThrow(() -> new UsernameNotFoundException("User not found"));
	}

	public Optional<AppUserPrincipal> loadById(Long userId) {
		return userRepository.findById(userId).map(AppUserPrincipal::from);
	}
}
