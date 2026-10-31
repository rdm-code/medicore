package com.medicore.hospitalmangement.repos;

import com.medicore.hospitalmangement.entities.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsersRepo extends JpaRepository<UserEntity,String> {
    boolean existsByEmail(String email);

    Optional<UserEntity> findByEmail(String email);
}
