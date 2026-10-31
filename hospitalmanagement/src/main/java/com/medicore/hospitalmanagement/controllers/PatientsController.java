package com.medicore.hospitalmanagement.controllers;

import com.medicore.hospitalmanagement.dtos.patients.PatientResponseDTO;
import com.medicore.hospitalmanagement.dtos.patients.PatientUpdateDTO;
import com.medicore.hospitalmanagement.services.PatientsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Patient profiles: patients manage their own, admins manage all. */
@RestController
@RequestMapping("/api/patients")
public class PatientsController {

    private final PatientsService service;

    public PatientsController(PatientsService service) {
        this.service = service;
    }

    // ---------- Own profile (PATIENT) ----------

    /** PATIENT: returns the caller's own profile. */
    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientResponseDTO> getMyProfile(Authentication auth) {
        return ResponseEntity.ok(service.getMyProfile(auth.getName()));
    }

    /** PATIENT: updates the caller's own profile (400 on invalid input). */
    @PutMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientResponseDTO> updateMyProfile(
            Authentication auth, @Valid @RequestBody PatientUpdateDTO dto) {
        return ResponseEntity.ok(service.updateMyProfile(auth.getName(), dto));
    }

    // ---------- Admin ----------

    /** ADMIN: lists all patients. */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PatientResponseDTO>> getAll() {
        return ResponseEntity.ok(service.getAllPatients());
    }

    /** ADMIN: returns one patient, or 404. */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")   // add doctor access later via an @authz check
    public ResponseEntity<PatientResponseDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(service.getPatientById(id));
    }

    /** ADMIN: updates any patient's profile. */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PatientResponseDTO> update(
            @PathVariable String id, @Valid @RequestBody PatientUpdateDTO dto) {
        return ResponseEntity.ok(service.updatePatient(id, dto));
    }

    /** ADMIN: deletes a patient together with the linked user. 204; 404 if missing. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.deletePatientById(id);
        return ResponseEntity.noContent().build();   // 204
    }
}