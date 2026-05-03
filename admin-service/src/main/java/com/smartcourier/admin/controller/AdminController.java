package com.smartcourier.admin.controller;

import com.smartcourier.admin.dto.DashboardStats;
import com.smartcourier.admin.dto.HubRequest;
import com.smartcourier.admin.entity.Hub;
import com.smartcourier.admin.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // ──  ──────────────────────────────────────────
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStats> getDashboard(
            @RequestHeader("X-User-Role") String role) {
        checkAdmin(role);
        return ResponseEntity.ok(
            adminService.getDashboardStats());
    }

    @GetMapping("/system/health")
    public ResponseEntity<com.smartcourier.admin.dto.HealthStatusResponse> getHealth(
            @RequestHeader("X-User-Role") String role) {
        checkAdmin(role);
        return ResponseEntity.ok(adminService.getSystemHealth());
    }

    @GetMapping("/recent-activity")
    public ResponseEntity<List<Map<String, Object>>> getRecentActivity(
            @RequestHeader("X-User-Role") String role) {
        checkAdmin(role);
        return ResponseEntity.ok(adminService.getRecentDeliveries());
    }

    // ── Deliveries ─────────────────────────────────────────
    @GetMapping("/deliveries")
    public ResponseEntity<List<Map<String, Object>>> getAllDeliveries(
            @RequestHeader("X-User-Role") String role) {
        checkAdmin(role);
        return ResponseEntity.ok(adminService.getAllDeliveries());
    }

    @PutMapping("/deliveries/{id}/resolve")
    public ResponseEntity<Map<String, Object>> resolveDelivery(
            @PathVariable Long id,
            @RequestParam String action,
            @RequestHeader("X-User-Role") String role) {
        checkAdmin(role);
        return ResponseEntity.ok(
            adminService.resolveDelivery(id, action));
    }

    // ── Reports ────────────────────────────────────────────
    @GetMapping("/reports")
    public ResponseEntity<Map<String, Object>> getReports(
            @RequestHeader("X-User-Role") String role) {
        checkAdmin(role);
        return ResponseEntity.ok(adminService.getReports());
    }

    // ── Hubs ───────────────────────────────────────────────
    @PostMapping("/hubs")
    public ResponseEntity<Hub> createHub(
            @Valid @RequestBody HubRequest request,
            @RequestHeader("X-User-Role") String role) {
        checkAdmin(role);
        return ResponseEntity.ok(adminService.createHub(request));
    }

    @GetMapping("/hubs")
    public ResponseEntity<List<Hub>> getAllHubs(
            @RequestHeader("X-User-Role") String role) {
        checkAdmin(role);
        return ResponseEntity.ok(adminService.getAllHubs());
    }

    @GetMapping("/hubs/active")
    public ResponseEntity<List<Hub>> getActiveHubs(
            @RequestHeader("X-User-Role") String role) {
        checkAdmin(role);
        return ResponseEntity.ok(adminService.getActiveHubs());
    }

    @PutMapping("/hubs/{id}/deactivate")
    public ResponseEntity<Hub> deactivateHub(
            @PathVariable Long id,
            @RequestHeader("X-User-Role") String role) {
        checkAdmin(role);
        return ResponseEntity.ok(adminService.deactivateHub(id));
    }

    // ── Private helper ─────────────────────────────────────
    private void checkAdmin(String role) {
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException(
                "Access denied. Admins only.");
        }
    }
}