package com.farmaid.config;

import com.farmaid.model.Role;
import com.farmaid.model.User;
import com.farmaid.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Creates the initial administrator from ADMIN_EMAIL / ADMIN_PASSWORD. Admins can never be created
 * through the public registration endpoint.
 */
@Component
public class AdminSeeder implements ApplicationRunner {

	private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final String email;
	private final String password;

	public AdminSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder,
					   @Value("${app.admin.email}") String email, @Value("${app.admin.password}") String password) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.email = email;
		this.password = password;
	}

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		if (email == null || email.isBlank() || password == null || password.isBlank()) {
			log.info("ADMIN_EMAIL/ADMIN_PASSWORD not set; skipping admin seeding");
			return;
		}
		if (userRepository.existsByEmailIgnoreCase(email)) {
			return;
		}
		User admin = new User();
		admin.setEmail(email.trim().toLowerCase());
		admin.setPassword(passwordEncoder.encode(password));
		admin.setUsername("Administrator");
		admin.setMobileNumber("0000000000");
		admin.setRole(Role.ADMIN);
		userRepository.save(admin);
		log.info("Seeded admin account {}", admin.getEmail());
	}
}
