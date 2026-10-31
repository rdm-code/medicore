package com.medicore.hospitalmangement.mappers;

import com.medicore.hospitalmangement.dtos.appointments.*;
import com.medicore.hospitalmangement.entities.AppointmentEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface AppointmentMapper {

    // patient and doctor are loaded and set in the service
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "status", ignore = true)      // always starts as SCHEDULED
    @Mapping(target = "notes", ignore = true)       // doctors only
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    AppointmentEntity toEntity(AppointmentCreateDTO dto);

    @Mapping(source = "doctor.id", target = "doctorId")
    @Mapping(source = "doctor.fullName", target = "doctorName")
    @Mapping(source = "doctor.specialization", target = "specialization")
    @Mapping(source = "patient.id", target = "patientId")
    @Mapping(source = "patient.fullName", target = "patientName")
    AppointmentResponseDTO toResponseDTO(AppointmentEntity entity);
}