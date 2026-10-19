package com.medicore.hospitalmangement.mappers;

import com.medicore.hospitalmangement.dtos.users.UserCreateDTO;
import com.medicore.hospitalmangement.dtos.users.UserDTO;
import com.medicore.hospitalmangement.dtos.users.UserResponseDTO;
import com.medicore.hospitalmangement.dtos.users.UserUpdateDTO;
import com.medicore.hospitalmangement.entities.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserEntity toEntity(UserDTO userDTO);
    UserEntity toEntity(UserCreateDTO userDTO);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "role", ignore = true)
    void updateEntity(UserUpdateDTO dto, @MappingTarget UserEntity entity);

    UserResponseDTO toResponseDTO(UserEntity userEntity);
}


