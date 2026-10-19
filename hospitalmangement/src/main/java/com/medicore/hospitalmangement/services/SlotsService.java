package com.medicore.hospitalmangement.services;

import com.medicore.hospitalmangement.entities.AppointmentStatus;
import com.medicore.hospitalmangement.exceptions.ResourceNotFoundException;
import com.medicore.hospitalmangement.repos.AppointmentsRepo;
import com.medicore.hospitalmangement.repos.DoctorsRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class SlotsService {

    private static final LocalTime OPEN_TIME  = LocalTime.of(8, 0);
    private static final LocalTime CLOSE_TIME = LocalTime.of(16, 0);
    private static final int SLOT_MINUTES = 30;

    private static final DateTimeFormatter HH_MM = DateTimeFormatter.ofPattern("HH:mm");

    private final AppointmentsRepo appointmentsRepo;
    private final DoctorsRepo doctorRepo;

    public SlotsService(AppointmentsRepo appointmentsRepo, DoctorsRepo doctorRepo) {
        this.appointmentsRepo = appointmentsRepo;
        this.doctorRepo = doctorRepo;
    }

    @Transactional(readOnly = true)
    public List<String> getAvailableSlots(String doctorId, LocalDate date) {
        if (!doctorRepo.existsById(doctorId)) {
            throw new ResourceNotFoundException("Doctor",doctorId);
        }

        // Only today or future dates
        if (date.isBefore(LocalDate.now())) {
            return List.of();
        }

        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd   = date.plusDays(1).atStartOfDay();

        List<LocalDateTime> booked = appointmentsRepo.findScheduledTimesForDoctorOnDay(
                doctorId, dayStart, dayEnd, AppointmentStatus.SCHEDULED
        );

        Set<LocalTime> bookedTimes = new HashSet<>();
        for (LocalDateTime dt : booked) {
            bookedTimes.add(dt.toLocalTime());
        }

        List<String> available = new ArrayList<>();
        LocalTime cursor = OPEN_TIME;
        while (cursor.isBefore(CLOSE_TIME)) {
            if (!bookedTimes.contains(cursor)) {
                available.add(cursor.format(HH_MM));
            }
            cursor = cursor.plusMinutes(SLOT_MINUTES);
        }
        return available;
    }
}