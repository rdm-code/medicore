package com.medicore.hospitalmangement.dtos.appointments;

import jakarta.validation.constraints.*;

public record AppointmentNotesDTO(
        @NotBlank(message = "Notes cannot be blank")
        @Size(max = 1000, message = "Notes must be at most 1000 characters")
        String notes
) {}