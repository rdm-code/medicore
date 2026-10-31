package com.medicore.hospitalmanagement.controllers;

import com.medicore.hospitalmanagement.dtos.appointments.*;
import com.medicore.hospitalmanagement.entities.AppointmentStatus;
import com.medicore.hospitalmanagement.services.AppointmentsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Appointment booking and lifecycle (SCHEDULED to COMPLETED or CANCELLED). Access rules are enforced per endpoint. */
@RestController
@RequestMapping("/api/appointments")
public class AppointmentsController {

    private final AppointmentsService service;

    public AppointmentsController(AppointmentsService service) {
        this.service = service;
    }

    /** PATIENT books a slot with a doctor. The patient is taken from the login, never from the body. 201; 400 invalid/off-boundary time, 404 unknown doctor, 409 slot taken. */
    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<AppointmentResponseDTO> book(
            Authentication auth, @Valid @RequestBody AppointmentCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.book(auth.getName(), dto));
    }

    /** PATIENT or DOCTOR: lists the caller's own appointments, ordered by time. */
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR')")
    public ResponseEntity<List<AppointmentResponseDTO>> getMine(Authentication auth) {
        return ResponseEntity.ok(service.getMine(auth.getName(), hasRole(auth, "DOCTOR")));
    }

    /** ADMIN: lists all appointments, optionally filtered by status and/or doctorId. */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AppointmentResponseDTO>> getAll(
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(required = false) String doctorId) {
        return ResponseEntity.ok(service.getAll(status, doctorId));
    }

    /** Returns one appointment to its patient, its doctor, or an admin (403 for anyone else, 404 if missing). */
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponseDTO> getById(@PathVariable String id, Authentication auth) {
        return ResponseEntity.ok(service.getById(id, auth.getName(), hasRole(auth, "ADMIN")));
    }

    /** Cancels a SCHEDULED appointment (participant or admin). 409 if it is already completed or cancelled. */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<AppointmentResponseDTO> cancel(@PathVariable String id, Authentication auth) {
        return ResponseEntity.ok(service.cancel(id, auth.getName(), hasRole(auth, "ADMIN")));
    }

    /** DOCTOR (assigned) or ADMIN marks a SCHEDULED appointment as COMPLETED. 409 if not SCHEDULED. */
    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<AppointmentResponseDTO> complete(@PathVariable String id, Authentication auth) {
        return ResponseEntity.ok(service.complete(id, auth.getName(), hasRole(auth, "ADMIN")));
    }

    /** The assigned DOCTOR writes visit notes (max 1000 chars). 409 on a cancelled appointment. */
    @PatchMapping("/{id}/notes")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<AppointmentResponseDTO> addNotes(
            @PathVariable String id, Authentication auth, @Valid @RequestBody AppointmentNotesDTO dto) {
        return ResponseEntity.ok(service.addNotes(id, auth.getName(), dto));
    }

    /** ADMIN permanently deletes an appointment. 204; 404 if missing. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private boolean hasRole(Authentication auth, String role) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
    }
}