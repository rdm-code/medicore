package com.medicore.hospitalmangement.services;

import com.medicore.hospitalmangement.entities.UserEntity;
import com.medicore.hospitalmangement.repos.UsersRepo;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsersRepo usersRepo;

    public CustomUserDetailsService(UsersRepo usersRepo) {
        this.usersRepo = usersRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String email) {
        UserEntity u = usersRepo.findByEmail(email)          // <-- database query
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return User.withUsername(u.getEmail())
                .password(u.getPassword())                   // BCrypt hash from the DB
                .authorities("ROLE_" + u.getRole().name())
                .disabled(!u.isEnabled())
                .build();
    }
}