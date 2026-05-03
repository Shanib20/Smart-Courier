package com.smartcourier.auth.controller;

import com.smartcourier.auth.entity.Notification;
import com.smartcourier.auth.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Get paginated notifications for the logged-in customer.
     * Default page size 10.
     */
    @GetMapping
    public ResponseEntity<Page<Notification>> getNotifications(
            @RequestHeader("X-User-Email") String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(notificationService.getNotifications(email.toLowerCase(), page, size));
    }

    /**
     * Lightweight endpoint for polling unread count.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @RequestHeader("X-User-Email") String email) {
        long count = notificationService.getUnreadCount(email.toLowerCase());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    /**
     * Mark a single notification as read.
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @RequestHeader("X-User-Email") String email) {
        notificationService.markAsRead(id, email.toLowerCase());
        return ResponseEntity.ok().build();
    }

    /**
     * Mark all notifications as read for the user.
     */
    @PutMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(
            @RequestHeader("X-User-Email") String email) {
        notificationService.markAllAsRead(email.toLowerCase());
        return ResponseEntity.ok().build();
    }
}
