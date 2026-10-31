package com.medicore.hospitalmangement.services;

import com.medicore.hospitalmangement.dtos.doctors.*;
import com.medicore.hospitalmangement.entities.DoctorEntity;
import com.medicore.hospitalmangement.entities.Role;      // adjust to where your enum lives
import com.medicore.hospitalmangement.entities.UserEntity;
import com.medicore.hospitalmangement.exceptions.DuplicateResourceException;
import com.medicore.hospitalmangement.exceptions.ResourceNotFoundException;
import com.medicore.hospitalmangement.mappers.DoctorMapper;
import com.medicore.hospitalmangement.repos.DoctorsRepo;
import com.medicore.hospitalmangement.repos.UsersRepo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class DoctorsService {

    private final DoctorsRepo repo;
    private final UsersRepo usersRepo;
    private final DoctorMapper mapper;
    private final PasswordEncoder passwordEncoder;

    public DoctorsService(DoctorsRepo repo, UsersRepo usersRepo,
                          DoctorMapper mapper, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.usersRepo = usersRepo;
        this.mapper = mapper;
        this.passwordEncoder = passwordEncoder;
    }

    // ---------- Read ----------

    /** Lists all doctors, or filters by specialization when it is provided. */
    public List<DoctorResponseDTO> getDoctors(String specialization) {
        List<DoctorEntity> doctors = (specialization == null || specialization.isBlank())
                ? repo.findAllWithUser()
                : repo.searchBySpecialization(specialization.trim());
        return doctors.stream().map(mapper::toResponseDTO).toList();
    }

    public DoctorResponseDTO getDoctorById(String id) {
        return mapper.toResponseDTO(findOrThrow(id));
    }

    public DoctorResponseDTO getMyProfile(String email) {
        return mapper.toResponseDTO(findByEmailOrThrow(email));
    }

    // ---------- Create (admin) ----------

    @Transactional
    public DoctorResponseDTO createDoctor(DoctorCreateDTO dto) {
        if (usersRepo.existsByEmail(dto.email())) {
            throw new DuplicateResourceException("Email address already exists.");
        }

        UserEntity user = UserEntity.builder()
                .email(dto.email())
                .displayName(dto.fullName())                       // remove if your entity has no such field
                .password(passwordEncoder.encode(dto.password()))
                .role(Role.DOCTOR)                                 // fixed server-side
                .enabled(true)
                .build();
        usersRepo.save(user);

        DoctorEntity doctor = mapper.toEntity(dto);
        doctor.setUser(user);
        return mapper.toResponseDTO(repo.save(doctor));
    }

    // ---------- Update ----------

    @Transactional
    public DoctorResponseDTO updateDoctor(String id, DoctorUpdateDTO dto) {
        DoctorEntity doctor = findOrThrow(id);
        mapper.updateEntity(dto, doctor);   // dirty checking issues the UPDATE
        return mapper.toResponseDTO(doctor);
    }

    @Transactional
    public DoctorResponseDTO updateMyProfile(String email, DoctorUpdateDTO dto) {
        DoctorEntity doctor = findByEmailOrThrow(email);
        mapper.updateEntity(dto, doctor);
        return mapper.toResponseDTO(doctor);
    }

    // ---------- Delete (admin) ----------

    @Transactional
    public void deleteDoctor(String id) {
        DoctorEntity doctor = findOrThrow(id);
        UserEntity user = doctor.getUser();
        // TODO: once appointments exist, throw a 409 if this doctor has future SCHEDULED ones
        repo.delete(doctor);       // profile first (holds the FK)
        usersRepo.delete(user);    // then the login account
    }

    // ---------- Helpers ----------

    private DoctorEntity findOrThrow(String id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", id));
    }

    private DoctorEntity findByEmailOrThrow(String email) {
        return repo.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile for " + email));
    }
}