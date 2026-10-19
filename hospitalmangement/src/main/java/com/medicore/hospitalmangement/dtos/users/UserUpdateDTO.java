package com.medicore.hospitalmangement.dtos.users;

import com.medicore.hospitalmangement.entities.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserUpdateDTO(
        @Email(message = "Invalid email format")
        String email,

        @Size(min = 6, message = "Password must be at least 6 characters long")
        String password,

        String displayName,

        @Pattern(regexp = "ADMIN|DOCTOR|PATIENT", message = "Role must be either ADMIN or DOCTOR or PATIENT")
        Role role,

        Boolean enabled
) {}