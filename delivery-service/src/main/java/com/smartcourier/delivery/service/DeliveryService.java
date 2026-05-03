package com.smartcourier.delivery.service;

import com.smartcourier.delivery.dto.DeliveryRequest;
import com.smartcourier.delivery.dto.DeliveryStatusMessage;
import com.smartcourier.delivery.dto.BookingCreatedEvent;
import com.smartcourier.delivery.dto.StatusUpdateRequest;
import com.smartcourier.delivery.dto.QuoteResponse;
import com.smartcourier.delivery.entity.Delivery;
import com.smartcourier.delivery.entity.DeliveryStatus;
import com.smartcourier.delivery.repository.DeliveryRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class DeliveryService {

    private static final Logger log = LoggerFactory.getLogger(DeliveryService.class);

    private final DeliveryRepository deliveryRepository;
    private final RabbitTemplate rabbitTemplate;
    private final PricingService pricingService;

    @Value("${smartcourier.rabbitmq.exchange}")
    private String exchange;

    @Value("${smartcourier.rabbitmq.routing-key}")
    private String routingKey;

    public DeliveryService(DeliveryRepository deliveryRepository,
                           RabbitTemplate rabbitTemplate,
                           PricingService pricingService) {
        this.deliveryRepository = deliveryRepository;
        this.rabbitTemplate = rabbitTemplate;
        this.pricingService = pricingService;
    }

    public Delivery createDelivery(DeliveryRequest request,
                                   String customerEmail) {
        String normalizedEmail = customerEmail.toLowerCase();
        Delivery delivery = new Delivery();
        delivery.setTrackingNumber(generateTrackingNumber());
        delivery.setCustomerEmail(normalizedEmail);
        delivery.setSenderName(request.getSenderName());
        delivery.setSenderPhone(request.getSenderPhone());
        delivery.setReceiverName(request.getReceiverName());
        delivery.setReceiverPhone(request.getReceiverPhone());
        delivery.setServiceType(request.getServiceType()
                .toUpperCase(Locale.ROOT));
        delivery.setPickupAddress(request.getPickupAddress());
        delivery.setDeliveryAddress(request.getDeliveryAddress());
        delivery.setPackageDetails(request.getPackageDetails());
        delivery.setScheduledPickupTime(request.getScheduledPickupTime());
        
        // Calculate Price and Dates using PricingService
        java.math.BigDecimal weight = java.math.BigDecimal.valueOf(request.getPackageDetails().getWeightKg() != null ? request.getPackageDetails().getWeightKg() : 0.0);
        QuoteResponse quote = pricingService.calculateQuote(request.getPickupAddress().getPincode(), request.getDeliveryAddress().getPincode(), weight);
        
        delivery.setChargeAmount(quote.getTotalAmount().doubleValue());
        delivery.setEstimatedDeliveryDate(LocalDateTime.now().plusDays(quote.getEstimatedDays()));
        
        delivery.setStatus(DeliveryStatus.BOOKED);
        delivery.setCreatedAt(LocalDateTime.now());
        delivery.setUpdatedAt(LocalDateTime.now());
        
        Delivery saved = deliveryRepository.save(delivery);
        
        // Notify other services
        publishBookingCreatedEvent(saved);
        publishStatusUpdate(saved, "Shipment booked and awaiting pickup");
        
        return saved;
    }

    public void sendReceipt(Long id, String customerEmail) {
        Delivery delivery = getById(id);
        if (!delivery.getCustomerEmail().equalsIgnoreCase(customerEmail)) {
            throw new RuntimeException("You can only request a receipt for your own delivery");
        }
        // Force sending email regardless of user settings
        publishBookingCreatedEvent(delivery, true);
    }

    public Page<Delivery> getMyDeliveries(String customerEmail, Pageable pageable) {
        return deliveryRepository.findByCustomerEmail(customerEmail.toLowerCase(), pageable);
    }

    public Delivery getById(Long id) {
        return deliveryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Delivery not found with id: " + id));
    }

    public Delivery getByTrackingNumber(String trackingNumber) {
        return deliveryRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() ->
                        new RuntimeException("Delivery not found: " + trackingNumber));
    }

    public Delivery updateStatus(Long id, StatusUpdateRequest request) {
        Delivery delivery = getById(id);
        DeliveryStatus newStatus = request.getStatus();
        DeliveryStatus currentStatus = delivery.getStatus();

        // Enforce valid status flow: BOOKED -> PICKED_UP -> IN_TRANSIT -> OUT_FOR_DELIVERY -> DELIVERED
        if (isInvalidTransition(currentStatus, newStatus)) {
            throw new RuntimeException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        delivery.setStatus(newStatus);
        delivery.setUpdatedAt(LocalDateTime.now());
        Delivery savedDelivery = deliveryRepository.save(delivery);

        // Always publish status update for tracking-service and notifications
        publishStatusUpdate(savedDelivery, request.getDescription());

        return savedDelivery;
    }

    public Delivery updateDelivery(Long id, DeliveryRequest request) {
        Delivery delivery = getById(id);
        
        if (delivery.getStatus() == DeliveryStatus.DELIVERED || delivery.getStatus() == DeliveryStatus.CANCELLED) {
            throw new RuntimeException("Cannot edit delivery in " + delivery.getStatus() + " state");
        }

        // Only editable fields: sender/receiver contact, package info, est delivery date
        delivery.setSenderPhone(request.getSenderPhone());
        delivery.setReceiverPhone(request.getReceiverPhone());
        delivery.setPackageDetails(request.getPackageDetails());
        delivery.setScheduledPickupTime(request.getScheduledPickupTime());
        
        // Note: In a real app, changing weight might trigger price recalculation.
        // For this bug fix, we'll keep it simple as requested.
        
        delivery.setUpdatedAt(LocalDateTime.now());
        return deliveryRepository.save(delivery);
    }

    private boolean isInvalidTransition(DeliveryStatus current, DeliveryStatus next) {
        if (current == DeliveryStatus.DELIVERED || current == DeliveryStatus.CANCELLED) {
            return true; // Final states
        }
        
        // Basic flow check
        int currentOrder = getStatusOrder(current);
        int nextOrder = getStatusOrder(next);
        
        // CANCELLED, FAILED, and RETURNED can happen almost anytime from active states
        return nextOrder < currentOrder && next != DeliveryStatus.CANCELLED && next != DeliveryStatus.FAILED && next != DeliveryStatus.RETURNED;
    }

    private int getStatusOrder(DeliveryStatus status) {
        return switch (status) {
            case BOOKED -> 1;
            case PICKED_UP -> 2;
            case IN_TRANSIT -> 3;
            case OUT_FOR_DELIVERY -> 4;
            case DELIVERED -> 5;
            default -> 0;
        };
    }

    private void publishStatusUpdate(Delivery delivery, String description) {
        DeliveryStatusMessage message = new DeliveryStatusMessage(
                delivery.getTrackingNumber(),
                delivery.getStatus().name(),
                description != null ? description : "Status updated to " + delivery.getStatus(),
                LocalDateTime.now()
        );
        message.setCustomerEmail(delivery.getCustomerEmail());
        
        // Use hardcoded routing key to ensure it hits the notification.queue
        rabbitTemplate.convertAndSend(exchange, "tracking.update", message);
    }

    public Page<Delivery> getAllDeliveries(String query, Pageable pageable) {
        if (query != null && !query.trim().isEmpty()) {
            return deliveryRepository.searchAll(query, pageable);
        }
        return deliveryRepository.findAll(pageable);
    }

    public List<Delivery> getByStatus(DeliveryStatus status) {
        return deliveryRepository.findByStatus(status);
    }

    public Delivery cancelDelivery(Long id, String customerEmail) {
        Delivery delivery = getById(id);
        if (!delivery.getCustomerEmail().equalsIgnoreCase(customerEmail)) {
            throw new RuntimeException("You can only cancel your own delivery");
        }
        if (delivery.getStatus() != DeliveryStatus.BOOKED) {
            throw new RuntimeException(
                    "Only BOOKED deliveries can be cancelled");
        }
        
        // 1-hour cancellation window logic
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        if (delivery.getCreatedAt().isBefore(oneHourAgo)) {
            throw new RuntimeException("Cancellation period (1 hour) has expired.");
        }

        delivery.setStatus(DeliveryStatus.CANCELLED);
        delivery.setUpdatedAt(LocalDateTime.now());
        return deliveryRepository.save(delivery);
    }

    private String generateTrackingNumber() {
        return "SC-" + LocalDateTime.now().getYear() + "-" + (int)(Math.random() * 900000 + 100000);
    }

    private void publishBookingCreatedEvent(Delivery delivery) {
        publishBookingCreatedEvent(delivery, false);
    }

    private void publishBookingCreatedEvent(Delivery delivery, boolean isManualReceipt) {
        BookingCreatedEvent event = new BookingCreatedEvent(
                delivery.getTrackingNumber(),
                delivery.getCustomerEmail(),
                delivery.getSenderName(),
                delivery.getReceiverName(),
                delivery.getChargeAmount(),
                delivery.getEstimatedDeliveryDate(),
                isManualReceipt
        );
        rabbitTemplate.convertAndSend(exchange, "booking.created", event);
        log.info("Published booking created event for tracking: {} (Manual: {})", 
                 delivery.getTrackingNumber(), isManualReceipt);
    }
}
