package com.medicore.hospitalmangement.controllers;

import com.medicore.hospitalmangement.dtos.appointments.*;
import com.medicore.hospitalmangement.entities.AppointmentStatus;
import com.medicore.hospitalmangement.services.AppointmentsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentsController {

    private final AppointmentsService service;

    public AppointmentsController(AppointmentsService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<AppointmentResponseDTO> book(
            Authentication auth, @Valid @RequestBody AppointmentCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.book(auth.getName(), dto));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR')")
    public ResponseEntity<List<AppointmentResponseDTO>> getMine(Authentication auth) {
        return ResponseEntity.ok(service.getMine(auth.getName(), hasRole(auth, "DOCTOR")));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AppointmentResponseDTO>> getAll(
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(required = false) String doctorId) {
        return ResponseEntity.ok(service.getAll(status, doctorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponseDTO> getById(@PathVariable String id, Authentication auth) {
        return ResponseEntity.ok(service.getById(id, auth.getName(), hasRole(auth, "ADMIN")));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<AppointmentResponseDTO> cancel(@PathVariable String id, Authentication auth) {
        return ResponseEntity.ok(service.cancel(id, auth.getName(), hasRole(auth, "ADMIN")));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<AppointmentResponseDTO> complete(@PathVariable String id, Authentication auth) {
        return ResponseEntity.ok(service.complete(id, auth.getName(), hasRole(auth, "ADMIN")));
    }

    @PatchMapping("/{id}/notes")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<AppointmentResponseDTO> addNotes(
            @PathVariable String id, Authentication auth, @Valid @RequestBody AppointmentNotesDTO dto) {
        return ResponseEntity.ok(service.addNotes(id, auth.getName(), dto));
    }

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