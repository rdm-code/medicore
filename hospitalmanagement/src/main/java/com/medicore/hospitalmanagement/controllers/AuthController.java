package com.medicore.hospitalmanagement.controllers;

import com.medicore.hospitalmanagement.dtos.auth.LoginRequestDTO;
import com.medicore.hospitalmanagement.dtos.patients.PatientCreateDTO;
import com.medicore.hospitalmanagement.dtos.patients.PatientResponseDTO;
import com.medicore.hospitalmanagement.services.PatientsService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final PatientsService patientsService;
    private final AuthenticationManager authManager;
    private final SecurityContextRepository securityContextRepository;

    public AuthController(PatientsService patientsService,
                          AuthenticationManager authManager,
                          SecurityContextRepository securityContextRepository) {
        this.patientsService = patientsService;
        this.authManager = authManager;
        this.securityContextRepository = securityContextRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<PatientResponseDTO> register(@Valid @RequestBody PatientCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(patientsService.createPatient(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @Valid @RequestBody LoginRequestDTO dto,
            HttpServletRequest request, HttpServletResponse response) {

        // Calls CustomUserDetailsService + BCrypt check; throws on failure
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.email(), dto.password()));

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);  // creates JSESSIONID

        String role = Objects.requireNonNull(auth.getAuthorities().iterator().next()
                .getAuthority()).replace("ROLE_", "");
        return ResponseEntity.ok(Map.of("email", auth.getName(), "role", role));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> me(Authentication auth) {
        String role = Objects.requireNonNull(auth.getAuthorities().iterator().next()
                .getAuthority()).replace("ROLE_", "");
        return ResponseEntity.ok(Map.of("email", auth.getName(), "role", role));
    }
}