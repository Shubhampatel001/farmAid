package com.farmaid.exception;

/** Duplicate data or an operation not allowed in the resource's current state. Mapped to HTTP 409. */
public class ConflictException extends RuntimeException {

	public ConflictException(String message) {
		super(message);
	}
}
