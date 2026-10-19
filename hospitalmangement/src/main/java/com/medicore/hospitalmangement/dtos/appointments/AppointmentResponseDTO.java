package com.medicore.hospitalmangement.dtos.appointments;

import com.medicore.hospitalmangement.entities.AppointmentStatus;
import java.time.Instant;
import java.time.LocalDateTime;

public record AppointmentResponseDTO(
        String id,
        String doctorId,
        String doctorName,
        String specialization,
        String patientId,
        String patientName,
        LocalDateTime appointmentTime,
        AppointmentStatus status,
        String reason,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {}