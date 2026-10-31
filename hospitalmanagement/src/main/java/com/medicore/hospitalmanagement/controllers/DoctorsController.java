package com.medicore.hospitalmanagement.controllers;

import com.medicore.hospitalmanagement.dtos.doctors.*;
import com.medicore.hospitalmanagement.services.DoctorsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Doctor directory (any logged-in user) and a doctor's own profile. */
@RestController
@RequestMapping("/api/doctors")
public class DoctorsController {

    private final DoctorsService service;

    public DoctorsController(DoctorsService service) {
        this.service = service;
    }

    /** DOCTOR: returns the caller's own profile. */
    // Declared before /{id} so "me" is never treated as an id
    @GetMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorResponseDTO> getMyProfile(Authentication auth) {
        return ResponseEntity.ok(service.getMyProfile(auth.getName()));
    }

    /** DOCTOR: updates the caller's own profile (400 on invalid input). */
    @PutMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorResponseDTO> updateMyProfile(
            Authentication auth, @Valid @RequestBody DoctorUpdateDTO dto) {
        return ResponseEntity.ok(service.updateMyProfile(auth.getName(), dto));
    }

    /** Lists doctors; optional case-insensitive partial match on specialization. */
    // Any logged-in user (security config already requires authentication)
    @GetMapping
    public ResponseEntity<List<DoctorResponseDTO>> getDoctors(
            @RequestParam(required = false) String specialization) {
        return ResponseEntity.ok(service.getDoctors(specialization));
    }

    /** Returns one doctor, or 404. */
    @GetMapping("/{id}")
    public ResponseEntity<DoctorResponseDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(service.getDoctorById(id));
    }
}