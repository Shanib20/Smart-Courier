package com.smartcourier.auth.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcourier.auth.dto.BookingCreatedEvent;
import com.smartcourier.auth.dto.DeliveryStatusMessage;
import com.smartcourier.auth.service.EmailService;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class BookingEventListener {

    @Autowired
    private EmailService emailService;

    @Autowired
    private com.smartcourier.auth.service.NotificationService notificationService;

    @Autowired
    private com.smartcourier.auth.repository.UserDeliveryRepository userDeliveryRepository;

    @Autowired
    private com.smartcourier.auth.repository.UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @RabbitListener(queues = "booking_queue")
    public void handleBookingCreatedEvent(BookingCreatedEvent event) {
        String subject = "Booking Confirmed: " + event.getTrackingNumber();
        String body = String.format(
            "Hello %s,\n\nYour courier booking from %s to %s has been confirmed!\n\n" +
            "Tracking Number: %s\n" +
            "Total Charge: ₹%.2f\n" +
            "Estimated Delivery: %s\n\n" +
            "Thank you for choosing SmartCourier!",
            event.getCustomerEmail(),
            event.getSenderName(),
            event.getReceiverName(),
            event.getTrackingNumber(),
            event.getChargeAmount(),
            event.getEstimatedDeliveryDate() != null ? event.getEstimatedDeliveryDate().toLocalDate().toString() : "TBD"
        );
        
        String email = event.getCustomerEmail().toLowerCase();
        com.smartcourier.auth.entity.User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user != null && !user.isEmailNotificationsEnabled() && !event.isManualReceipt()) {
            System.out.println("Email notifications disabled for user: " + email + ". Skipping automated mail.");
        } else {
            emailService.sendBookingConfirmationEmail(email, subject, body);
            String type = event.isManualReceipt() ? "Manual Receipt" : "Booking Confirmation";
            System.out.println(type + " email sent to: " + email);
        }
        
        // Save tracking mapping for future notifications
        if (userDeliveryRepository.findByTrackingNumber(event.getTrackingNumber()).isEmpty()) {
            userDeliveryRepository.save(new com.smartcourier.auth.entity.UserDelivery(event.getTrackingNumber(), event.getCustomerEmail().toLowerCase()));
            System.out.println("Tracking mapping saved: " + event.getTrackingNumber() + " -> " + event.getCustomerEmail().toLowerCase());
        }
    }
}
