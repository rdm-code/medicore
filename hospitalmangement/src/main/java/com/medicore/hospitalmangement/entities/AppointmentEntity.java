package com.medicore.hospitalmangement.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "appointments",
//        uniqueConstraints = @UniqueConstraint( //Used to prevent overlapping schedules for a certain doctor
//                name = "uk_doctor_slot",
//                columnNames = {"doctor_id", "appointment_time"}
//        ),
        indexes = { //Used for fast reads
                @Index(name = "idx_appt_patient", columnList = "patient_id"),
                @Index(name = "idx_appt_doctor_time", columnList = "doctor_id, appointment_time")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private PatientEntity patient;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private DoctorEntity doctor;

    @Column(name = "appointment_time", nullable = false)
    private LocalDateTime appointmentTime;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;

    @Column(length = 500)
    private String reason;          // patient's reason for visit

    @Column(length = 1000)
    private String notes;           // doctor's notes, set by the doctor only

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}
