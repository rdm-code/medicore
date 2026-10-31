package com.medicore.hospitalmangement.dtos.appointments;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

/** Patient books an appointment. The patient comes from the login, never from this body. */
public record AppointmentCreateDTO(
        @NotBlank(message = "Doctor id is required")
        String doctorId,

        @NotNull(message = "Appointment time is required")
        @Future(message = "Appointment time must be in the future")
        LocalDateTime appointmentTime,

        @Size(max = 500, message = "Reason must be at most 500 characters")
        String reason
) {}