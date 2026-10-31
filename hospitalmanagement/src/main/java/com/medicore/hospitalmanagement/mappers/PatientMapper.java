package com.medicore.hospitalmanagement.mappers;

import com.medicore.hospitalmanagement.dtos.patients.PatientCreateDTO;
import com.medicore.hospitalmanagement.dtos.patients.PatientResponseDTO;
import com.medicore.hospitalmanagement.dtos.patients.PatientUpdateDTO;
import com.medicore.hospitalmanagement.entities.PatientEntity;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface PatientMapper {

    // Create: user is set in the service after the UserEntity is saved
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    PatientEntity toEntity(PatientCreateDTO dto);

    // Update: modifies the existing managed entity in place
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(PatientUpdateDTO dto, @MappingTarget PatientEntity entity);

    // Response: email comes from the nested user
    @Mapping(source = "user.email", target = "email")
    PatientResponseDTO toResponseDTO(PatientEntity entity);
}