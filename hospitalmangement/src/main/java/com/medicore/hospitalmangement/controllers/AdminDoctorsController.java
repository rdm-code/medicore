package com.medicore.hospitalmangement.controllers;

import com.medicore.hospitalmangement.dtos.doctors.*;
import com.medicore.hospitalmangement.services.DoctorsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/doctors")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDoctorsController {

    private final DoctorsService service;

    public AdminDoctorsController(DoctorsService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<DoctorResponseDTO> create(@Valid @RequestBody DoctorCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createDoctor(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorResponseDTO> update(
            @PathVariable String id, @Valid @RequestBody DoctorUpdateDTO dto) {
        return ResponseEntity.ok(service.updateDoctor(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.deleteDoctor(id);
        return ResponseEntity.noContent().build();   // 204
    }
}