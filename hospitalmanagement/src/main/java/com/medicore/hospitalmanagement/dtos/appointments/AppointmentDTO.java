package com.medicore.hospitalmanagement.dtos.appointments;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record AppointmentDTO(
        @NotNull Long doctorId,
        @NotNull @Future LocalDateTime appointmentTime,
        @Size(max = 500) String reason
) {
}

