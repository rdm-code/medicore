package com.medicore.hospitalmangement.repos;

import com.medicore.hospitalmangement.entities.AppointmentEntity;
import com.medicore.hospitalmangement.entities.AppointmentStatus;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AppointmentsRepo extends JpaRepository<AppointmentEntity, String> {

    // join fetch avoids N+1 queries when the mapper reads doctor and patient names
    @Query("""
           select a from AppointmentEntity a
           join fetch a.doctor join fetch a.patient
           where a.id = :id
           """)
    Optional<AppointmentEntity> findByIdWithDetails(@Param("id") String id);

    @Query("""
           select a from AppointmentEntity a
           join fetch a.doctor join fetch a.patient p
           where p.user.email = :email
           order by a.appointmentTime
           """)
    List<AppointmentEntity> findByPatientEmail(@Param("email") String email);

    @Query("""
           select a from AppointmentEntity a
           join fetch a.doctor d join fetch a.patient
           where d.user.email = :email
           order by a.appointmentTime
           """)
    List<AppointmentEntity> findByDoctorEmail(@Param("email") String email);

    @Query("""
           select a from AppointmentEntity a
           join fetch a.doctor d join fetch a.patient
           where (:status is null or a.status = :status)
             and (:doctorId is null or d.id = :doctorId)
           order by a.appointmentTime
           """)
    List<AppointmentEntity> search(@Param("status") AppointmentStatus status,
                                   @Param("doctorId") String doctorId);

    boolean existsByDoctorIdAndAppointmentTimeAndStatusNot(
            String doctorId, LocalDateTime time, AppointmentStatus status);

    /**
     * All SCHEDULED appointment times for a doctor within [dayStart, dayEnd).
     * Used to compute available slots.
     */
    @Query("""
        select a.appointmentTime
          from AppointmentEntity a
         where a.doctor.id = :doctorId
           and a.appointmentTime >= :dayStart
           and a.appointmentTime <  :dayEnd
           and a.status = :status
        """)
    List<LocalDateTime> findScheduledTimesForDoctorOnDay(
            @Param("doctorId") String doctorId,
            @Param("dayStart") LocalDateTime dayStart,
            @Param("dayEnd")   LocalDateTime dayEnd,
            @Param("status")   AppointmentStatus status
    );
}