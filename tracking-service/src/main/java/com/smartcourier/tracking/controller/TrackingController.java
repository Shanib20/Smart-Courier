package com.smartcourier.tracking.controller;

import com.smartcourier.tracking.dto.DeliveryProofRequest;
import com.smartcourier.tracking.dto.TrackingEventRequest;
import com.smartcourier.tracking.entity.DeliveryProof;
import com.smartcourier.tracking.entity.Document;
import com.smartcourier.tracking.entity.TrackingEvent;
import com.smartcourier.tracking.service.TrackingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/tracking")
public class TrackingController {

    @Autowired
    private TrackingService trackingService;

    // Add tracking event (admin/system)
    @PostMapping("/events")
    public ResponseEntity<TrackingEvent> addEvent(
            @Valid @RequestBody TrackingEventRequest request,
            @RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied. Admins only.");
        }
        return ResponseEntity.ok(trackingService.addEvent(request));
    }

    // Get tracking events by tracking number (customer/admin)
    @GetMapping("/{trackingNumber}")
    public ResponseEntity<List<TrackingEvent>> getEvents(
            @PathVariable String trackingNumber) {
        return ResponseEntity.ok(
            trackingService.getEvents(trackingNumber));
    }

    // Upload document (customer)
    @PostMapping("/documents/upload")
    public ResponseEntity<Document> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("trackingNumber") String trackingNumber)
            throws IOException {
        return ResponseEntity.ok(
            trackingService.uploadDocument(file, trackingNumber));
    }

    // Get documents for a tracking number
    @GetMapping("/documents/{trackingNumber}")
    public ResponseEntity<List<Document>> getDocuments(
            @PathVariable String trackingNumber) {
        return ResponseEntity.ok(
            trackingService.getDocuments(trackingNumber));
    }

    // Add delivery proof (admin)
    @PostMapping("/proof")
    public ResponseEntity<DeliveryProof> addProof(
            @Valid @RequestBody DeliveryProofRequest request,
            @RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied. Admins only.");
        }
        return ResponseEntity.ok(trackingService.addProof(request));
    }

    // Get delivery proof
    @GetMapping("/proof/{trackingNumber}")
    public ResponseEntity<DeliveryProof> getProof(
            @PathVariable String trackingNumber) {
        return ResponseEntity.ok(
            trackingService.getProof(trackingNumber));
    }
}