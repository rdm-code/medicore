package com.medicore.hospitalmangement.controllers;

import com.medicore.hospitalmangement.dtos.doctors.*;
import com.medicore.hospitalmangement.services.DoctorsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorsController {

    private final DoctorsService service;

    public DoctorsController(DoctorsService service) {
        this.service = service;
    }

    // Declared before /{id} so "me" is never treated as an id
    @GetMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorResponseDTO> getMyProfile(Authentication auth) {
        return ResponseEntity.ok(service.getMyProfile(auth.getName()));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorResponseDTO> updateMyProfile(
            Authentication auth, @Valid @RequestBody DoctorUpdateDTO dto) {
        return ResponseEntity.ok(service.updateMyProfile(auth.getName(), dto));
    }

    // Any logged-in user (security config already requires authentication)
    @GetMapping
    public ResponseEntity<List<DoctorResponseDTO>> getDoctors(
            @RequestParam(required = false) String specialization) {
        return ResponseEntity.ok(service.getDoctors(specialization));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorResponseDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(service.getDoctorById(id));
    }
}