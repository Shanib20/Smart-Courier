package com.smartcourier.auth.controller;

import com.smartcourier.auth.service.AuthService;
import com.smartcourier.auth.client.DeliveryServiceClient;
import com.smartcourier.auth.entity.AccountStatus;
import com.smartcourier.auth.entity.User;
import com.smartcourier.auth.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;
    private final DeliveryServiceClient deliveryServiceClient;
    private final AuthService authService;

    public AdminUserController(UserRepository userRepository, DeliveryServiceClient deliveryServiceClient, AuthService authService) {
        this.userRepository = userRepository;
        this.deliveryServiceClient = deliveryServiceClient;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<Page<User>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String role) {
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        if (role != null && !role.isEmpty()) {
            return ResponseEntity.ok(userRepository.findByRole(User.Role.valueOf(role.toUpperCase()), pageRequest));
        }
        return ResponseEntity.ok(userRepository.findAll(pageRequest));
    }

    @GetMapping("/{id}/activity")
    public ResponseEntity<DeliveryServiceClient.UserActivity> getUserActivity(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(deliveryServiceClient.getActivity(user.getEmail()));
    }

    @PatchMapping("/{id}/suspend")
    public ResponseEntity<?> toggleSuspend(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Safety: Admin cannot suspend themselves
        // In a real app, we'd check against the current authenticated user's email/id
        
        if (user.getStatus() == AccountStatus.ACTIVE) {
            user.setStatus(AccountStatus.SUSPENDED);
        } else {
            user.setStatus(AccountStatus.ACTIVE);
        }
        
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User status updated to " + user.getStatus()));
    }

    @PostMapping("/invite")
    public ResponseEntity<?> inviteAdmin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String name = request.get("name");
        authService.createAdmin(email, name);
        return ResponseEntity.ok(Map.of("message", "Admin invitation sent to " + email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, @RequestHeader("X-User-Email") String adminEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Safety: Cannot delete yourself
        if (user.getEmail().equals(adminEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You cannot delete your own account"));
        }

        if (user.getRole() == User.Role.ADMIN) {
            long adminCount = userRepository.countByRole(User.Role.ADMIN);
            if (adminCount <= 1) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "System must have at least one administrator"));
            }
        } else {
            // Rule for Customers: Check active bookings
            DeliveryServiceClient.UserActivity activity = deliveryServiceClient.getActivity(user.getEmail());
            if (activity.activeBookings() > 0) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "User has " + activity.activeBookings() + " active deliveries. Cannot delete."));
            }
        }

        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}
