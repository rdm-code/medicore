package com.medicore.hospitalmanagement.repos;

import com.medicore.hospitalmanagement.entities.Role;
import com.medicore.hospitalmanagement.entities.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsersRepo extends JpaRepository<UserEntity,String> {
    boolean existsByEmail(String email);

    boolean existsByRole(Role role);

    Optional<UserEntity> findByEmail(String email);
}
