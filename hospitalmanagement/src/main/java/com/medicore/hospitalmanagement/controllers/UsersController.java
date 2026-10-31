package com.medicore.hospitalmanagement.controllers;

import com.medicore.hospitalmanagement.dtos.users.UserCreateDTO;
import com.medicore.hospitalmanagement.dtos.users.UserResponseDTO;
import com.medicore.hospitalmanagement.dtos.users.UserUpdateDTO;
import com.medicore.hospitalmanagement.services.UsersService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** ADMIN only: user account management. */
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")   // every endpoint here is admin only
public class UsersController {

    private final UsersService usersService;

    public UsersController(UsersService usersService) {
        this.usersService = usersService;
    }

    /** Lists all users (passwords are never returned). */
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getUsers() {
        return ResponseEntity.ok(usersService.getUsers());
    }

    /** Returns one user, or 404. */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(usersService.getUserById(id));
    }

    /** Creates a user with any role. The password is BCrypt-hashed. 409 if the email exists. */
    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@RequestBody @Valid UserCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usersService.createUser(dto));
    }

    /** Updates email, password, display name or enabled flag. 404 if missing, 409 on duplicate email. */
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable String id,
            @RequestBody @Valid UserUpdateDTO dto) {
        return ResponseEntity.ok(usersService.updateUser(id, dto));
    }

    /** Deletes a user. 204; 404 if missing. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        usersService.deleteUser(id);
        return ResponseEntity.noContent().build();   // 204
    }
}