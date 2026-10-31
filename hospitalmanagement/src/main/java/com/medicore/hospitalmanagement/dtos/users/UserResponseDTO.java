package com.medicore.hospitalmanagement.dtos.users;

import com.medicore.hospitalmanagement.entities.Role;
import java.time.Instant;

public record UserResponseDTO(
        String id,
        String email,
        String displayName,
        Role role,
        boolean enabled,
        Instant createdAt,
        Instant updatedAt
) {
}