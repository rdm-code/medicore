package com.medicore.hospitalmangement.repos;

import com.medicore.hospitalmangement.entities.DoctorEntity;
import jakarta.persistence.LockModeType;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DoctorsRepo extends JpaRepository<DoctorEntity, String> {

    @Query("select d from DoctorEntity d join fetch d.user")
    List<DoctorEntity> findAllWithUser();

    @Query("""
           select d from DoctorEntity d join fetch d.user
           where lower(d.specialization) like lower(concat('%', :spec, '%'))
           """)
    List<DoctorEntity> searchBySpecialization(@Param("spec") String spec);

    Optional<DoctorEntity> findByUserEmail(String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from DoctorEntity d where d.id = :id")
    Optional<DoctorEntity> findByIdForUpdate(@Param("id") String id);

//    Optional<DoctorEntity> findByIdForUpdate(@NotBlank(message = "Doctor id is required") String id);
}