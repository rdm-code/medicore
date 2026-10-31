package com.medicore.hospitalmanagement.services;

import com.medicore.hospitalmanagement.dtos.patients.PatientCreateDTO;
import com.medicore.hospitalmanagement.dtos.patients.PatientResponseDTO;
import com.medicore.hospitalmanagement.dtos.patients.PatientUpdateDTO;
import com.medicore.hospitalmanagement.entities.PatientEntity;
import com.medicore.hospitalmanagement.entities.Role;
import com.medicore.hospitalmanagement.entities.UserEntity;
import com.medicore.hospitalmanagement.exceptions.DuplicateResourceException;
import com.medicore.hospitalmanagement.exceptions.ResourceNotFoundException;
import com.medicore.hospitalmanagement.mappers.PatientMapper;
import com.medicore.hospitalmanagement.repos.PatientsRepo;
import com.medicore.hospitalmanagement.repos.UsersRepo;   // adjust to your user repo name
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)   // default for reads; write methods override below
public class PatientsService {

    private final PatientsRepo repo;
    private final UsersRepo usersRepo;
    private final PatientMapper mapper;
    private final PasswordEncoder passwordEncoder;

    public PatientsService(PatientsRepo repo, UsersRepo usersRepo,
                           PatientMapper mapper, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.usersRepo = usersRepo;
        this.mapper = mapper;
        this.passwordEncoder = passwordEncoder;
    }

    // ---------- Read ----------

    public List<PatientResponseDTO> getAllPatients() {
        return repo.findAll().stream().map(mapper::toResponseDTO).toList();
    }

    public PatientResponseDTO getPatientById(String id) {
        return mapper.toResponseDTO(findOrThrow(id));
    }

    /** For GET /api/patients/me: the patient is derived from the logged-in email. */
    public PatientResponseDTO getMyProfile(String email) {
        PatientEntity patient = repo.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile for " + email));
        return mapper.toResponseDTO(patient);
    }

    // ---------- Create (self-registration) ----------

    @Transactional
    public PatientResponseDTO createPatient(PatientCreateDTO dto) {
        if (usersRepo.existsByEmail(dto.email())) {
            throw new DuplicateResourceException("Email address already exists.");
        }

        UserEntity user = UserEntity.builder()
                .email(dto.email())
                .displayName(dto.fullName())                       // remove if your entity has no such field
                .password(passwordEncoder.encode(dto.password()))  // always hash
                .role(Role.PATIENT)                                // fixed server-side, never from the client
                .enabled(true)
                .build();
        usersRepo.save(user);

        PatientEntity patient = mapper.toEntity(dto);
        patient.setUser(user);
        return mapper.toResponseDTO(repo.save(patient));
    }

    // ---------- Update ----------

    @Transactional
    public PatientResponseDTO updatePatient(String id, PatientUpdateDTO dto) {
        PatientEntity patient = findOrThrow(id);
        mapper.updateEntity(dto, patient);           // in-place; dirty checking issues the UPDATE
        return mapper.toResponseDTO(patient);
    }

    @Transactional
    public PatientResponseDTO updateMyProfile(String email, PatientUpdateDTO dto) {
        PatientEntity patient = repo.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile for " + email));
        mapper.updateEntity(dto, patient);
        return mapper.toResponseDTO(patient);
    }

    // ---------- Delete ----------

    @Transactional
    public void deletePatientById(String id) {
        PatientEntity patient = findOrThrow(id);
        UserEntity user = patient.getUser();
        repo.delete(patient);        // profile first (it holds the FK)
        usersRepo.delete(user);      // then the login account
    }

    // ---------- Helper ----------

    private PatientEntity findOrThrow(String id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", id));
    }
}