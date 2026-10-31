package com.medicore.hospitalmanagement.services;

import com.medicore.hospitalmanagement.dtos.appointments.*;
import com.medicore.hospitalmanagement.entities.*;
import com.medicore.hospitalmanagement.exceptions.*;
import com.medicore.hospitalmanagement.mappers.AppointmentMapper;
import com.medicore.hospitalmanagement.repos.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AppointmentsService {

    private static final int SLOT_MINUTES = 30;

    private final AppointmentsRepo repo;
    private final PatientsRepo patientsRepo;
    private final DoctorsRepo doctorsRepo;
    private final AppointmentMapper mapper;

    public AppointmentsService(AppointmentsRepo repo, PatientsRepo patientsRepo,
                               DoctorsRepo doctorsRepo, AppointmentMapper mapper) {
        this.repo = repo;
        this.patientsRepo = patientsRepo;
        this.doctorsRepo = doctorsRepo;
        this.mapper = mapper;
    }

    // ---------- Book (PATIENT) ----------

    @Transactional
    public AppointmentResponseDTO book(String patientEmail, AppointmentCreateDTO dto) {
        PatientEntity patient = patientsRepo.findByUserEmail(patientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile for " + patientEmail));

        // Row lock on the doctor: two simultaneous bookings for the same doctor run one after the other
        DoctorEntity doctor = doctorsRepo.findByIdForUpdate(dto.doctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", dto.doctorId()));

        validateSlot(dto.appointmentTime());

        if (repo.existsByDoctorIdAndAppointmentTimeAndStatusNot(
                doctor.getId(), dto.appointmentTime(), AppointmentStatus.CANCELLED)) {
            throw new SlotAlreadyBookedException("Doctor is already booked at " + dto.appointmentTime());
        }

        AppointmentEntity appointment = mapper.toEntity(dto);
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        return mapper.toResponseDTO(repo.save(appointment));
    }

    // ---------- Read ----------

    public List<AppointmentResponseDTO> getAll(AppointmentStatus status, String doctorId) {
        return repo.search(status, doctorId).stream().map(mapper::toResponseDTO).toList();
    }

    public List<AppointmentResponseDTO> getMine(String email, boolean isDoctor) {
        List<AppointmentEntity> list = isDoctor
                ? repo.findByDoctorEmail(email)
                : repo.findByPatientEmail(email);
        return list.stream().map(mapper::toResponseDTO).toList();
    }

    public AppointmentResponseDTO getById(String id, String email, boolean isAdmin) {
        AppointmentEntity a = findOrThrow(id);
        requireParticipantOrAdmin(a, email, isAdmin);
        return mapper.toResponseDTO(a);
    }

    // ---------- Status changes ----------

    @Transactional
    public AppointmentResponseDTO cancel(String id, String email, boolean isAdmin) {
        AppointmentEntity a = findOrThrow(id);
        requireParticipantOrAdmin(a, email, isAdmin);
        transition(a, AppointmentStatus.CANCELLED);
        return mapper.toResponseDTO(a);
    }

    @Transactional
    public AppointmentResponseDTO complete(String id, String email, boolean isAdmin) {
        AppointmentEntity a = findOrThrow(id);
        if (!isAdmin && !isDoctorOf(a, email)) {
            throw new AccessDeniedException("Only the assigned doctor can complete this appointment");
        }
        transition(a, AppointmentStatus.COMPLETED);
        return mapper.toResponseDTO(a);
    }

    @Transactional
    public AppointmentResponseDTO addNotes(String id, String doctorEmail, AppointmentNotesDTO dto) {
        AppointmentEntity a = findOrThrow(id);
        if (!isDoctorOf(a, doctorEmail)) {
            throw new AccessDeniedException("Only the assigned doctor can add notes");
        }
        if (a.getStatus() == AppointmentStatus.CANCELLED) {
            throw new InvalidStatusTransitionException("Cannot add notes to a cancelled appointment");
        }
        a.setNotes(dto.notes().trim());
        return mapper.toResponseDTO(a);
    }

    // ---------- Delete (ADMIN) ----------

    @Transactional
    public void delete(String id) {
        repo.delete(findOrThrow(id));
    }

    // ---------- Helpers ----------

    private AppointmentEntity findOrThrow(String id) {
        return repo.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));
    }

    /** Only SCHEDULED appointments may change; COMPLETED and CANCELLED are final. */
    private void transition(AppointmentEntity a, AppointmentStatus target) {
        if (a.getStatus() != AppointmentStatus.SCHEDULED) {
            throw new InvalidStatusTransitionException(
                    "Cannot change a " + a.getStatus() + " appointment to " + target);
        }
        a.setStatus(target);
    }

    /** Slots start on the hour or half hour, e.g. 10:00 or 10:30. */
    private void validateSlot(LocalDateTime time) {
        if (time.getMinute() % SLOT_MINUTES != 0 || time.getSecond() != 0 || time.getNano() != 0) {
            throw new IllegalArgumentException(
                    "Appointments must start on a " + SLOT_MINUTES + "-minute boundary (e.g. 10:00, 10:30)");
        }
    }

    private boolean isPatientOf(AppointmentEntity a, String email) {
        return a.getPatient().getUser().getEmail().equals(email);
    }

    private boolean isDoctorOf(AppointmentEntity a, String email) {
        return a.getDoctor().getUser().getEmail().equals(email);
    }

    private void requireParticipantOrAdmin(AppointmentEntity a, String email, boolean isAdmin) {
        if (!isAdmin && !isPatientOf(a, email) && !isDoctorOf(a, email)) {
            throw new AccessDeniedException("You do not have access to this appointment");
        }
    }
}