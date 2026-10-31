package com.medicore.hospitalmanagement.services;

import com.medicore.hospitalmanagement.dtos.users.UserCreateDTO;
import com.medicore.hospitalmanagement.dtos.users.UserResponseDTO;
import com.medicore.hospitalmanagement.dtos.users.UserUpdateDTO;
import com.medicore.hospitalmanagement.entities.UserEntity;
import com.medicore.hospitalmanagement.exceptions.DuplicateResourceException;
import com.medicore.hospitalmanagement.exceptions.ResourceNotFoundException;
import com.medicore.hospitalmanagement.mappers.UserMapper;
import com.medicore.hospitalmanagement.repos.UsersRepo;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsersService {

    UsersRepo repo;
    UserMapper mapper;
    private final PasswordEncoder passwordEncoder;

    public UsersService(UsersRepo repo, UserMapper mapper, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.mapper = mapper;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserResponseDTO> getUsers() {
        //        System.out.println(users);
        return repo.findAll().stream().map(mapper::toResponseDTO).toList();
    }

    public UserResponseDTO getUserById(String id) {
        return mapper.toResponseDTO(findOrThrow(id));
    }

    @Transactional
    public UserResponseDTO createUser(UserCreateDTO dto) {
        if (repo.existsByEmail(dto.email())) {
            throw new DuplicateResourceException("Email address already exists.");
        }
        UserEntity user = mapper.toEntity(dto);
        user.setPassword(passwordEncoder.encode(dto.password()));   // always hash
        return mapper.toResponseDTO(repo.save(user));
    }

    @Transactional
    public UserResponseDTO updateUser(String id, UserUpdateDTO dto) {
        UserEntity user = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));

        if (dto.email() != null && !dto.email().equals(user.getEmail())) {
            if (repo.existsByEmail(dto.email())) {
                throw new DuplicateResourceException("Email address already exists.");
            }
            user.setEmail(dto.email());
        }

        if (dto.password() != null && !dto.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(dto.password()));
        }

        mapper.updateEntity(dto, user);   // displayName, enabled, etc.
        return mapper.toResponseDTO(user);
    }

    @Transactional
    public void deleteUser(String id) {
        repo.delete(findOrThrow(id));
    }

    public boolean existsByEmail(String email) {
        return repo.existsByEmail(email);
    }

    private UserEntity findOrThrow(String id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", id));
    }}
