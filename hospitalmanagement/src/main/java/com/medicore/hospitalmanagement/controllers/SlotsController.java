package com.medicore.hospitalmanagement.controllers;

import com.medicore.hospitalmanagement.services.SlotsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class SlotsController {

    private final SlotsService slotsService;

    public SlotsController(SlotsService slotsService) {
        this.slotsService = slotsService;
    }

    /**
     * GET /api/doctors/{id}/available-slots?date=2026-11-02
     *
     * Returns: ["08:00","08:30","09:00","09:30","10:00","10:30","11:00",
     *           "11:30","12:00","12:30","13:00","13:30","14:00","14:30",
     *           "15:00","15:30"]
     * minus any slots already booked for that doctor on that date.
     */
    @GetMapping("/{id}/available-slots")
    @PreAuthorize("hasAnyRole('ADMIN','PATIENT','DOCTOR')")
    public ResponseEntity<List<String>> getAvailableSlots(
            @PathVariable String id,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(slotsService.getAvailableSlots(id, date));
    }
}