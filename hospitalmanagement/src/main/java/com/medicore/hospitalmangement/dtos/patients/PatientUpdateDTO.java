package com.medicore.hospitalmangement.dtos.patients;

import jakarta.validation.constraints.*;

public record PatientUpdateDTO(

        @NotBlank(message = "Full name is required")
        @Size(max = 100, message = "Full name must be at most 100 characters")
        String fullName,

//        @NotNull(message = "Age is required")
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