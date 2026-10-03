package com.farmaid.security;

import com.farmaid.model.Role;
import com.farmaid.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/** Authenticated user as seen by controllers via {@code @AuthenticationPrincipal}. */
public record AppUserPrincipal(Long id, String email, String password, Role role) implements UserDetails {

	public static AppUserPrincipal from(User user) {
		return new AppUserPrincipal(user.getUserId(), user.getEmail(), user.getPassword(), user.getRole());
	}

	public boolean isAdmin() {
		return role == Role.ADMIN;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
	}

	@Override
	public String getPassword() {
		return password;
	}

	@Override
	public String getUsername() {
		return email;
	}

	@Override
	public String toString() {
		return "AppUserPrincipal[id=" + id + ", email=" + email + ", role=" + role + "]";
	}
}
