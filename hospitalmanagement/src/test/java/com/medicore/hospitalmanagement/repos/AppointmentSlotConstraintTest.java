package com.medicore.hospitalmanagement.repos;

import com.medicore.hospitalmanagement.entities.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

/** Verifies the database itself refuses double booking (the service-level check is only the first line of defence). */
@SpringBootTest
@Transactional   // each test is rolled back
class AppointmentSlotConstraintTest {

    @Autowired UsersRepo usersRepo;
    @Autowired DoctorsRepo doctorsRepo;
    @Autowired PatientsRepo patientsRepo;
    @Autowired AppointmentsRepo appointmentsRepo;

    DoctorEntity doctor;
    PatientEntity patient;
    final LocalDateTime slot = LocalDateTime.now().plusDays(2).withHour(11).withMinute(0).withSecond(0).withNano(0);

    @BeforeEach
    void setUp() {
        UserEntity doctorUser = usersRepo.save(UserEntity.builder()
                .email("slot.doctor@test.local").password("x").role(Role.DOCTOR).build());
        UserEntity patientUser = usersRepo.save(UserEntity.builder()
                .email("slot.patient@test.local").password("x").role(Role.PATIENT).build());
        doctor = doctorsRepo.save(DoctorEntity.builder()
                .user(doctorUser).fullName("Doc").specialization("ENT").build());
        patient = patientsRepo.save(PatientEntity.builder()
                .user(patientUser).fullName("Pat").age(30).gender("MALE").build());
    }

    private AppointmentEntity newAppointment() {
        return AppointmentEntity.builder().doctor(doctor).patient(patient).appointmentTime(slot).build();
    }

    @Test
    void twoActiveAppointmentsInSameSlot_areRejectedByDatabase() {
        appointmentsRepo.saveAndFlush(newAppointment());

        assertThrows(DataIntegrityViolationException.class,
                () -> appointmentsRepo.saveAndFlush(newAppointment()));
    }

    @Test
    void cancelledSlot_canBeBookedAgain() {
        AppointmentEntity first = appointmentsRepo.saveAndFlush(newAppointment());
        first.setStatus(AppointmentStatus.CANCELLED);
        appointmentsRepo.saveAndFlush(first);

        assertDoesNotThrow(() -> appointmentsRepo.saveAndFlush(newAppointment()));
    }
}
