package com.medicore.hospitalmanagement.dtos.doctors;

import jakarta.validation.constraints.NotNull;

public record DoctorDTO(
        @NotNull String fullName,
        @NotNull String specialization,
        //TODO: Phone number validation
        String phoneNumber
) {
}

