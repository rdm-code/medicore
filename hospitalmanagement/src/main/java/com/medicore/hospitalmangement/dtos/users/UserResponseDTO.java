package com.medicore.hospitalmangement.dtos.users;

import com.medicore.hospitalmangement.entities.Role;
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