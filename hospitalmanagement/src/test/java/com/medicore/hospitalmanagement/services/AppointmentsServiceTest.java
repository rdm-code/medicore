package com.medicore.hospitalmanagement.services;

import com.medicore.hospitalmanagement.dtos.appointments.AppointmentCreateDTO;
import com.medicore.hospitalmanagement.dtos.appointments.AppointmentResponseDTO;
import com.medicore.hospitalmanagement.entities.*;
import com.medicore.hospitalmanagement.exceptions.InvalidStatusTransitionException;
import com.medicore.hospitalmanagement.exceptions.ResourceNotFoundException;
import com.medicore.hospitalmanagement.exceptions.SlotAlreadyBookedException;
import com.medicore.hospitalmanagement.mappers.AppointmentMapper;
import com.medicore.hospitalmanagement.repos.AppointmentsRepo;
import com.medicore.hospitalmanagement.repos.DoctorsRepo;
import com.medicore.hospitalmanagement.repos.PatientsRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/** Pure unit tests: repositories and the mapper are mocked, so only the business rules are exercised. */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AppointmentsServiceTest {

    private static final String PATIENT_EMAIL = "patient@test.local";
    private static final String DOCTOR_EMAIL = "doctor@test.local";

    @Mock AppointmentsRepo repo;
    @Mock PatientsRepo patientsRepo;
    @Mock DoctorsRepo doctorsRepo;
    @Mock AppointmentMapper mapper;

    AppointmentsService service;
    PatientEntity patient;
    DoctorEntity doctor;
    AppointmentResponseDTO responseDto;

    @BeforeEach
    void setUp() {
        service = new AppointmentsService(repo, patientsRepo, doctorsRepo, mapper);

        patient = PatientEntity.builder().id("p1").fullName("Pat Ient")
                .user(UserEntity.builder().email(PATIENT_EMAIL).role(Role.PATIENT).build()).build();
        doctor = DoctorEntity.builder().id("d1").fullName("Doc Tor").specialization("Cardiology")
                .user(UserEntity.builder().email(DOCTOR_EMAIL).role(Role.DOCTOR).build()).build();
        responseDto = new AppointmentResponseDTO("a1", "d1", "Doc Tor", "Cardiology", "p1", "Pat Ient",
                tomorrowAt(10, 0), AppointmentStatus.SCHEDULED, null, null, null, null);

        when(patientsRepo.findByUserEmail(PATIENT_EMAIL)).thenReturn(Optional.of(patient));
        when(doctorsRepo.findByIdForUpdate("d1")).thenReturn(Optional.of(doctor));
        when(mapper.toResponseDTO(any())).thenReturn(responseDto);
    }

    private static LocalDateTime tomorrowAt(int hour, int minute) {
        return LocalDateTime.now().plusDays(1).withHour(hour).withMinute(minute).withSecond(0).withNano(0);
    }

    private AppointmentEntity appointmentWith(AppointmentStatus status) {
        return AppointmentEntity.builder().id("a1").patient(patient).doctor(doctor)
                .appointmentTime(tomorrowAt(10, 0)).status(status).build();
    }

    // ---------- booking ----------

    @Test
    void book_freeSlot_savesAppointmentForLoggedInPatientAndDoctor() {
        LocalDateTime time = tomorrowAt(10, 0);
        var dto = new AppointmentCreateDTO("d1", time, "checkup");
        when(repo.existsByDoctorIdAndAppointmentTimeAndStatusNot("d1", time, AppointmentStatus.CANCELLED))
                .thenReturn(false);
        when(mapper.toEntity(dto)).thenReturn(new AppointmentEntity());
        when(repo.save(any(AppointmentEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        service.book(PATIENT_EMAIL, dto);

        ArgumentCaptor<AppointmentEntity> saved = ArgumentCaptor.forClass(AppointmentEntity.class);
        verify(repo).save(saved.capture());
        assertSame(patient, saved.getValue().getPatient());
        assertSame(doctor, saved.getValue().getDoctor());
    }

    @Test
    void book_takenSlot_throwsSlotAlreadyBooked() {
        LocalDateTime time = tomorrowAt(10, 30);
        when(repo.existsByDoctorIdAndAppointmentTimeAndStatusNot("d1", time, AppointmentStatus.CANCELLED))
                .thenReturn(true);

        assertThrows(SlotAlreadyBookedException.class,
                () -> service.book(PATIENT_EMAIL, new AppointmentCreateDTO("d1", time, null)));
        verify(repo, never()).save(any());
    }

    @Test
    void book_timeNotOnHalfHour_isRejected() {
        var dto = new AppointmentCreateDTO("d1", tomorrowAt(10, 15), null);

        assertThrows(IllegalArgumentException.class, () -> service.book(PATIENT_EMAIL, dto));
        verify(repo, never()).save(any());
    }

    @Test
    void book_unknownDoctor_throwsNotFound() {
        when(doctorsRepo.findByIdForUpdate("missing")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.book(PATIENT_EMAIL, new AppointmentCreateDTO("missing", tomorrowAt(9, 0), null)));
    }

    // ---------- status changes ----------

    @Test
    void cancel_scheduledAppointment_byItsPatient_becomesCancelled() {
        AppointmentEntity a = appointmentWith(AppointmentStatus.SCHEDULED);
        when(repo.findByIdWithDetails("a1")).thenReturn(Optional.of(a));

        service.cancel("a1", PATIENT_EMAIL, false);

        assertEquals(AppointmentStatus.CANCELLED, a.getStatus());
    }

    @Test
    void cancel_completedAppointment_isRejected() {
        when(repo.findByIdWithDetails("a1")).thenReturn(Optional.of(appointmentWith(AppointmentStatus.COMPLETED)));

        assertThrows(InvalidStatusTransitionException.class, () -> service.cancel("a1", PATIENT_EMAIL, false));
    }

    @Test
    void cancel_byStranger_isAccessDenied() {
        when(repo.findByIdWithDetails("a1")).thenReturn(Optional.of(appointmentWith(AppointmentStatus.SCHEDULED)));

        assertThrows(AccessDeniedException.class, () -> service.cancel("a1", "stranger@test.local", false));
    }

    @Test
    void complete_byDifferentDoctor_isAccessDenied() {
        when(repo.findByIdWithDetails("a1")).thenReturn(Optional.of(appointmentWith(AppointmentStatus.SCHEDULED)));

        assertThrows(AccessDeniedException.class, () -> service.complete("a1", "other.doctor@test.local", false));
    }

    @Test
    void complete_byAdmin_isAllowed() {
        AppointmentEntity a = appointmentWith(AppointmentStatus.SCHEDULED);
        when(repo.findByIdWithDetails("a1")).thenReturn(Optional.of(a));

        service.complete("a1", "admin@test.local", true);

        assertEquals(AppointmentStatus.COMPLETED, a.getStatus());
    }

    @Test
    void getById_unknownId_throwsNotFound() {
        when(repo.findByIdWithDetails(eq("nope"))).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getById("nope", PATIENT_EMAIL, false));
    }
}
