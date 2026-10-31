package com.medicore.hospitalmanagement.dtos.doctors;

import jakarta.validation.constraints.*;

/** Profile fields only. Used by admin (PUT /{id}) and by the doctor (PUT /me). */
public record DoctorUpdateDTO(
        @NotBlank(message = "Full name is required")
        @Size(max = 100, message = "Full name must be at most 100 characters")
        String fullName,

        @NotBlank(message = "Specialization is required")
        @Size(max = 100, message = "Specialization must be at most 100 characters")
        String specialization,

        @Pattern(regexp = "^[6-9]\\d{9}$",
                message = "Phone must be a valid 10-digit Indian mobile number")
        String phone
) {}