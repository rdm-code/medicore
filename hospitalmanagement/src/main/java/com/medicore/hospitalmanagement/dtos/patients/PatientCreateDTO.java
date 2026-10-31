package com.medicore.hospitalmanagement.dtos.patients;

import jakarta.validation.constraints.*;

public record PatientCreateDTO(

        // ---- User (login) fields ----
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 6, max = 20, message = "Password must be 6 to 20 characters")
        String password,

        // ---- Patient profile fields ----
        @NotBlank(message = "Full name is required")
        @Size(max = 100, message = "Full name must be at most 100 characters")
        String fullName,

        @NotNull(message = "Age is required")
        @Min(value = 0, message = "Age cannot be negative")
        @Max(value = 130, message = "Age must be realistic")
        Integer age,

        @NotBlank(message = "Gender is required")
        @Pattern(regexp = "(?i)MALE|FEMALE|OTHER",
                message = "Gender must be MALE, FEMALE or OTHER")
        String gender,

        @Pattern(regexp = "^[6-9]\\d{9}$",
                message = "Phone must be a valid 10-digit Indian mobile number")
        String phone
) {}