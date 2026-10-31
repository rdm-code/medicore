package com.medicore.hospitalmanagement.controllers;

import com.medicore.hospitalmanagement.dtos.doctors.*;
import com.medicore.hospitalmanagement.services.DoctorsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** ADMIN only: create, update and delete doctors (a doctor is a user account plus a profile). */
@RestController
@RequestMapping("/api/admin/doctors")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDoctorsController {

    private final DoctorsService service;

    public AdminDoctorsController(DoctorsService service) {
        this.service = service;
    }

    /** Creates the login (role DOCTOR) and the doctor profile together. 201; 409 if the email exists. */
    @PostMapping
    public ResponseEntity<DoctorResponseDTO> create(@Valid @RequestBody DoctorCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createDoctor(dto));
    }

    /** Updates a doctor's profile. 404 if missing. */
    @PutMapping("/{id}")
    public ResponseEntity<DoctorResponseDTO> update(
            @PathVariable String id, @Valid @RequestBody DoctorUpdateDTO dto) {
        return ResponseEntity.ok(service.updateDoctor(id, dto));
    }

    /** Deletes a doctor and the linked user. 204; 404 if missing. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.deleteDoctor(id);
        return ResponseEntity.noContent().build();   // 204
    }
}