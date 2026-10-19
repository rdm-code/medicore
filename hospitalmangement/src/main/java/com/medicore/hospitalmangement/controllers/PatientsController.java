package com.medicore.hospitalmangement.controllers;

import com.medicore.hospitalmangement.dtos.patients.PatientResponseDTO;
import com.medicore.hospitalmangement.dtos.patients.PatientUpdateDTO;
import com.medicore.hospitalmangement.services.PatientsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientsController {

    private final PatientsService service;

    public PatientsController(PatientsService service) {
        this.service = service;
    }

    // ---------- Own profile (PATIENT) ----------

    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientResponseDTO> getMyProfile(Authentication auth) {
        return ResponseEntity.ok(service.getMyProfile(auth.getName()));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientResponseDTO> updateMyProfile(
            Authentication auth, @Valid @RequestBody PatientUpdateDTO dto) {
        return ResponseEntity.ok(service.updateMyProfile(auth.getName(), dto));
    }

    // ---------- Admin ----------

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PatientResponseDTO>> getAll() {
        return ResponseEntity.ok(service.getAllPatients());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")   // add doctor access later via an @authz check
    public ResponseEntity<PatientResponseDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(service.getPatientById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PatientResponseDTO> update(
            @PathVariable String id, @Valid @RequestBody PatientUpdateDTO dto) {
        return ResponseEntity.ok(service.updatePatient(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.deletePatientById(id);
        return ResponseEntity.noContent().build();   // 204
    }
}