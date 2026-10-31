package com.medicore.hospitalmanagement.dtos.doctors;

import jakarta.validation.constraints.*;

/** Admin creates a doctor: login fields + profile fields. Role is fixed server-side. */
public record DoctorCreateDTO(
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 6, max = 20, message = "Password must be 6 to 20 characters")
        String password,

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