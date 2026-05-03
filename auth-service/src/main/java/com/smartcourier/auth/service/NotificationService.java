package com.smartcourier.auth.service;

import com.smartcourier.auth.entity.Notification;
import com.smartcourier.auth.entity.User;
import com.smartcourier.auth.repository.NotificationRepository;
import com.smartcourier.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private static final int MAX_NOTIFICATIONS = 50;

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void createNotification(String userEmail, String title, String message, String trackingId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        Notification notification = new Notification(user, title, message, trackingId);
        notificationRepository.save(notification);

        // Cleanup oldest if limit exceeded
        long count = notificationRepository.countByUser(user);
        if (count > MAX_NOTIFICATIONS) {
            int toDelete = (int) (count - MAX_NOTIFICATIONS);
            List<Long> oldestIds = notificationRepository.findOldestIds(user, PageRequest.of(0, toDelete));
            notificationRepository.deleteAllById(oldestIds);
            log.info("Deleted {} oldest notifications for user {}", toDelete, userEmail);
        }
    }

    public Page<Notification> getNotifications(String userEmail, int page, int size) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        return notificationRepository.findByUserOrderByCreatedAtDesc(user, PageRequest.of(page, size));
    }

    public long getUnreadCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    @Transactional
    public void markAsRead(Long id, String userEmail) {
        notificationRepository.findById(id).ifPresent(n -> {
            if (n.getUser().getEmail().equalsIgnoreCase(userEmail)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @Transactional
    public void markAllAsRead(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        notificationRepository.markAllAsRead(user);
    }
}
