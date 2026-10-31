package com.medicore.hospitalmanagement.exceptions;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Single place that turns exceptions into the JSON {@link ErrorResponse} the API promises.
 * Specific handlers come first; the {@code Exception} handler at the bottom is only a safety net.
 * Spring always picks the most specific matching handler, so ordering here is for readability.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ---------- 404 / 409: domain exceptions ----------

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), req, null);
    }

    @ExceptionHandler({DuplicateResourceException.class,
            SlotAlreadyBookedException.class,
            InvalidStatusTransitionException.class})
    public ResponseEntity<ErrorResponse> handleConflict(RuntimeException ex, HttpServletRequest req) {
        return build(HttpStatus.CONFLICT, ex.getMessage(), req, null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex,
                                                             HttpServletRequest req) {
        String details = String.valueOf(ex.getMostSpecificCause().getMessage()).toUpperCase();
        String message = "A database constraint violation occurred.";
        if (details.contains("ACTIVE_SLOT_KEY")) {
            message = "Doctor is already booked at that time.";   // DB-level double-booking guard
        } else if (details.contains("EMAIL")) {
            message = "Email address already exists.";
        }
        return build(HttpStatus.CONFLICT, message, req, null);
    }

    // ---------- 400: bad input ----------

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex,
                                                          HttpServletRequest req) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(fe -> fieldErrors.putIfAbsent(fe.getField(), fe.getDefaultMessage()));
        // The frontend shows `message`, so make it readable on its own
        String message = String.join("; ", fieldErrors.values());
        return build(HttpStatus.BAD_REQUEST, message.isBlank() ? "Validation failed" : message, req, fieldErrors);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex,
                                                               HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), req, null);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadable(HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "Malformed or unreadable request body", req, null);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex,
                                                            HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "Invalid value for parameter '" + ex.getName() + "'", req, null);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParam(MissingServletRequestParameterException ex,
                                                            HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "Missing required parameter '" + ex.getParameterName() + "'", req, null);
    }

    // ---------- 401 / 403: security ----------

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(HttpServletRequest req) {
        return build(HttpStatus.UNAUTHORIZED, "Invalid email or password", req, null);
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ErrorResponse> handleDisabled(HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, "Account is disabled", req, null);
    }

    /**
     * Covers @PreAuthorize denials and the ownership checks in the services.
     * Without this handler the catch-all below would turn them into a 500.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, "You do not have permission to do this", req, null);
    }

    // ---------- 500: safety net ----------

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleOther(Exception ex, HttpServletRequest req) {
        log.error("Unhandled exception on {} {}", req.getMethod(), req.getRequestURI(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong", req, null);
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String message,
                                                HttpServletRequest req,
                                                Map<String, String> fieldErrors) {
        ErrorResponse body = new ErrorResponse(
                Instant.now(), status.value(), status.getReasonPhrase(),
                message, req.getRequestURI(), fieldErrors);
        return ResponseEntity.status(status).body(body);
    }
}
