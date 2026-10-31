package com.medicore.hospitalmanagement.dtos.users;

import jakarta.validation.constraints.*;

public record UserCreateDTO(
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters long")
        String password,

        String displayName,

        @NotNull(message = "Role is required")
        @Pattern(regexp = "ADMIN|DOCTOR|PATIENT", message = "Role must be either ADMIN or DOCTOR or PATIENT")
        String role
) {}