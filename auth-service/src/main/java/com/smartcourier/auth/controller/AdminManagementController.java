package com.smartcourier.auth.controller;

import com.smartcourier.auth.dto.CreateAdminRequest;
import com.smartcourier.auth.entity.User;
import com.smartcourier.auth.repository.UserRepository;
import com.smartcourier.auth.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth/admins")
@PreAuthorize("hasRole('ADMIN')")
public class AdminManagementController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllAdmins() {
        List<User> admins = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.ADMIN)
                .collect(Collectors.toList());

        List<Map<String, Object>> response = admins.stream()
                .<Map<String, Object>>map(a -> Map.of(
                        "id", a.getId(),
                        "name", a.getName(),
                        "email", a.getEmail(),
                        "verified", a.isVerified()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> createAdmin(@Valid @RequestBody CreateAdminRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email is already registered."));
        }

        String tempPassword = UUID.randomUUID().toString().substring(0, 8);

        User admin = new User();
        admin.setName(request.getName());
        admin.setEmail(request.getEmail());
        admin.setPassword(passwordEncoder.encode(tempPassword));
        admin.setRole(User.Role.ADMIN);
        admin.setVerified(true);
        admin.setTwoFactorEnabled(false);
        admin.setPasswordChangeRequired(true);

        userRepository.save(admin);

        emailService.sendAdminWelcomeEmail(admin.getEmail(), tempPassword);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Admin created successfully. Welcome email sent."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable Long id, @RequestHeader("X-User-Email") String currentUserEmail) {
        Optional<User> targetOpt = userRepository.findById(id);
        if (targetOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Admin not found."));
        }

        User target = targetOpt.get();

        if (target.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "User is not an admin."));
        }

        if (target.getEmail().equals(currentUserEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "You cannot delete yourself."));
        }

        long adminCount = userRepository.findAll().stream().filter(u -> u.getRole() == User.Role.ADMIN).count();
        if (adminCount <= 1) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Cannot delete the last remaining admin."));
        }

        userRepository.delete(target);
        return ResponseEntity.ok(Map.of("message", "Admin deleted successfully."));
    }
}
