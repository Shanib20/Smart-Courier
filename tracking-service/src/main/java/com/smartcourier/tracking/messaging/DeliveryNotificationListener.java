package com.smartcourier.tracking.messaging;

import com.smartcourier.tracking.dto.BookingCreatedEvent;
import com.smartcourier.tracking.dto.DeliveryStatusMessage;
import com.smartcourier.tracking.service.TrackingService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class DeliveryNotificationListener {

    private final TrackingService trackingService;

    public DeliveryNotificationListener(TrackingService trackingService) {
        this.trackingService = trackingService;
    }

    @RabbitListener(queues = "tracking_update_queue")
    public void handleDeliveryStatusUpdate(DeliveryStatusMessage message) {
        trackingService.addDeliveredEvent(message);
    }

    @RabbitListener(queues = "booking_tracking_queue")
    public void handleBookingCreated(BookingCreatedEvent event) {
        trackingService.initializeTracking(event);
    }
}
