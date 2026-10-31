package com.medicore.hospitalmangement.dtos.doctors;

import java.time.Instant;

public record DoctorResponseDTO(
        String id,
        String email,
        String fullName,
        String specialization,
        String phone,
        Instant updatedAt
) {}