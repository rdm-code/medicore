package com.medicore.hospitalmanagement.dtos.patients;

import java.time.Instant;

public record PatientResponseDTO(
        String id,
        String email,
        String fullName,
        Integer age,
        String gender,
        String phone,
        Instant updatedAt
) {}
