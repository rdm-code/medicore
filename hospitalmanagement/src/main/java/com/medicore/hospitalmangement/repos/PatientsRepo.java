package com.medicore.hospitalmangement.repos;

import com.medicore.hospitalmangement.entities.PatientEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PatientsRepo extends JpaRepository<PatientEntity, String> {

    Optional<PatientEntity> findByUserEmail(String email);

    // Avoids N+1 queries when mapping user.email for every patient
    @Query("select p from PatientEntity p join fetch p.user")
    List<PatientEntity> findAllWithUser();
}