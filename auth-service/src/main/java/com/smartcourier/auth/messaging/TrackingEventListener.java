package com.smartcourier.auth.messaging;

import com.smartcourier.auth.dto.DeliveryStatusMessage;
import com.smartcourier.auth.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class TrackingEventListener {

    private static final Logger log = LoggerFactory.getLogger(TrackingEventListener.class);
    private final NotificationService notificationService;

    public TrackingEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = "notification.queue")
    public void handleTrackingUpdate(DeliveryStatusMessage message) {
        try {
            if (message.getCustomerEmail() == null || message.getCustomerEmail().isEmpty()) {
                log.warn("Received tracking update without customer email: {}", message.getTrackingNumber());
                return;
            }

            String title = "Package Update: " + message.getStatus();
            String content = "Your package " + message.getTrackingNumber() + " is now: " + message.getDescription();

            notificationService.createNotification(
                    message.getCustomerEmail().toLowerCase(),
                    title,
                    content,
                    message.getTrackingNumber()
            );

            log.info("Notification created for user {} regarding tracking {}", 
                    message.getCustomerEmail(), message.getTrackingNumber());
            
        } catch (Exception e) {
            log.error("Error processing tracking update for notification: {}", e.getMessage());
        }
    }
}
