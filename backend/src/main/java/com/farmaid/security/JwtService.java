package com.farmaid.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

@Service
public class JwtService {

	private final SecretKey key;
	private final Duration validity;

	public JwtService(@Value("${app.jwt.secret}") String secret,
					  @Value("${app.jwt.expiration-minutes}") long expirationMinutes) {
		if (secret == null || secret.isBlank()) {
			throw new IllegalStateException("JWT_SECRET must be set (at least 32 bytes, base64 recommended)");
		}
		byte[] bytes = decode(secret);
		if (bytes.length < 32) {
			throw new IllegalStateException("JWT_SECRET must be at least 256 bits (32 bytes)");
		}
		this.key = Keys.hmacShaKeyFor(bytes);
		this.validity = Duration.ofMinutes(expirationMinutes);
	}

	public record IssuedToken(String token, Instant expiresAt) {
	}

	public IssuedToken issue(AppUserPrincipal user) {
		Instant now = Instant.now();
		Instant expiresAt = now.plus(validity);
		String token = Jwts.builder()
				.subject(String.valueOf(user.id()))
				.claim("email", user.email())
				.claim("role", user.role().name())
				.issuedAt(Date.from(now))
				.expiration(Date.from(expiresAt))
				.signWith(key)
				.compact();
		return new IssuedToken(token, expiresAt);
	}

	/** Returns the user id from a valid, unexpired token. */
	public Optional<Long> parseUserId(String token) {
		try {
			Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
			return Optional.of(Long.valueOf(claims.getSubject()));
		} catch (JwtException | IllegalArgumentException e) {
			return Optional.empty();
		}
	}

	private static byte[] decode(String secret) {
		try {
			return Decoders.BASE64.decode(secret);
		} catch (RuntimeException notBase64) {
			return secret.getBytes(StandardCharsets.UTF_8);
		}
	}
}
