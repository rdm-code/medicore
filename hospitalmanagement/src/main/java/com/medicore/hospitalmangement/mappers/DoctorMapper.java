package com.medicore.hospitalmangement.mappers;

import com.medicore.hospitalmangement.dtos.doctors.*;
import com.medicore.hospitalmangement.entities.DoctorEntity;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface DoctorMapper {

    // user is set in the service after the UserEntity is saved
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    DoctorEntity toEntity(DoctorCreateDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(DoctorUpdateDTO dto, @MappingTarget DoctorEntity entity);

    @Mapping(source = "user.email", target = "email")
    DoctorResponseDTO toResponseDTO(DoctorEntity entity);
}