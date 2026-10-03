package com.farmaid.exception;

/** Business-rule validation failure on otherwise well-formed input. Mapped to HTTP 400. */
public class BadRequestException extends RuntimeException {

	public BadRequestException(String message) {
		super(message);
	}
}
