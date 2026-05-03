package com.smartcourier.delivery.controller;

import com.smartcourier.delivery.dto.DeliveryRequest;
import com.smartcourier.delivery.dto.StatusUpdateRequest;
import com.smartcourier.delivery.entity.Delivery;
import com.smartcourier.delivery.entity.DeliveryStatus;
import com.smartcourier.delivery.service.DeliveryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/deliveries")
public class DeliveryController {

    @Autowired
    private DeliveryService deliveryService;

    // Customer creates a delivery
    @PostMapping
    public ResponseEntity<Delivery> create(
            @Valid @RequestBody DeliveryRequest request,
            @RequestHeader("X-User-Email") String email) {
        return ResponseEntity.ok(
            deliveryService.createDelivery(request, email));
    }

    // Customer views their own deliveries
    @GetMapping("/my")
    public ResponseEntity<Page<Delivery>> getMyDeliveries(
            @RequestHeader("X-User-Email") String email,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(
            deliveryService.getMyDeliveries(email, pageable));
    }

    // Get delivery by ID
    @GetMapping("/{id}")
    public ResponseEntity<Delivery> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(deliveryService.getById(id));
    }

    // Get delivery by tracking number
    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<Delivery> getByTracking(
            @PathVariable String trackingNumber) {
        return ResponseEntity.ok(
            deliveryService.getByTrackingNumber(trackingNumber));
    }

    // Admin updates delivery status
    @PutMapping("/{id}/status")
    public ResponseEntity<Delivery> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request,
            @RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied. Admins only.");
        }
        return ResponseEntity.ok(
            deliveryService.updateStatus(id, request));
    }

    // Admin updates delivery details (Bug Fix 3)
    @PutMapping("/{id}")
    public ResponseEntity<Delivery> update(
            @PathVariable Long id,
            @RequestBody DeliveryRequest request,
            @RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied. Admins only.");
        }
        return ResponseEntity.ok(deliveryService.updateDelivery(id, request));
    }

    // Admin gets all deliveries
    @GetMapping("/all")
    public ResponseEntity<Page<Delivery>> getAllDeliveries(
            @RequestHeader("X-User-Role") String role,
            @RequestParam(required = false) String query,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied. Admins only.");
        }
        return ResponseEntity.ok(deliveryService.getAllDeliveries(query, pageable));
    }

    // Customer cancels a delivery
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Delivery> cancel(
            @PathVariable Long id,
            @RequestHeader("X-User-Email") String email) {
        return ResponseEntity.ok(
            deliveryService.cancelDelivery(id, email));
    }

    // Customer requests email receipt
    @PostMapping("/{id}/receipt")
    public ResponseEntity<java.util.Map<String, String>> requestReceipt(
            @PathVariable Long id,
            @RequestHeader("X-User-Email") String email) {
        deliveryService.sendReceipt(id, email);
        return ResponseEntity.ok(java.util.Map.of("message", "Receipt emailed successfully"));
    }
}