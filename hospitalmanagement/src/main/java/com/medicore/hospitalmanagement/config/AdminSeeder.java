package com.medicore.hospitalmanagement.config;

import com.medicore.hospitalmanagement.entities.Role;
import com.medicore.hospitalmanagement.entities.UserEntity;
import com.medicore.hospitalmanagement.repos.UsersRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates the first ADMIN on startup if none exists. Registration only creates PATIENTs and every
 * /api/admin/** endpoint needs an ADMIN, so without this a fresh database has no way to get one.
 * Credentials come from app.admin.email / app.admin.password (env ADMIN_EMAIL / ADMIN_PASSWORD).
 */
@Component
public class AdminSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UsersRepo usersRepo;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;

    public AdminSeeder(UsersRepo usersRepo, PasswordEncoder passwordEncoder,
                       @Value("${app.admin.email}") String email,
                       @Value("${app.admin.password}") String password) {
        this.usersRepo = usersRepo;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(String... args) {
        if (usersRepo.existsByRole(Role.ADMIN)) {
            return;
        }
        usersRepo.save(UserEntity.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .displayName("Administrator")
                .role(Role.ADMIN)
                .build());
        log.warn("No ADMIN found - created default admin '{}'. Change this password before deploying.", email);
    }
}
