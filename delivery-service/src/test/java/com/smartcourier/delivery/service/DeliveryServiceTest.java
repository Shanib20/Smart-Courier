package com.smartcourier.delivery.service;

import com.smartcourier.delivery.dto.DeliveryRequest;
import com.smartcourier.delivery.dto.DeliveryStatusMessage;
import com.smartcourier.delivery.dto.StatusUpdateRequest;
import com.smartcourier.delivery.dto.QuoteResponse;
import com.smartcourier.delivery.entity.Address;
import com.smartcourier.delivery.entity.Delivery;
import com.smartcourier.delivery.entity.DeliveryStatus;
import com.smartcourier.delivery.entity.PackageDetails;
import com.smartcourier.delivery.repository.DeliveryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeliveryServiceTest {

    @Mock
    private DeliveryRepository deliveryRepository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @Mock
    private PricingService pricingService;

    @InjectMocks
    private DeliveryService deliveryService;

    @Test
    void createDeliveryShouldPopulateBookingDefaultsAndCharge() {
        ReflectionTestUtils.setField(deliveryService, "exchange", "delivery.exchange");
        ReflectionTestUtils.setField(deliveryService, "routingKey", "delivery.status.update");

        DeliveryRequest request = buildRequest("EXPRESS", 2.5);
        
        QuoteResponse quote = new QuoteResponse();
        quote.setTotalAmount(new java.math.BigDecimal("250.0"));
        quote.setEstimatedDays(3);
        when(pricingService.calculateQuote(any(), any(), any())).thenReturn(quote);

        when(deliveryRepository.save(any(Delivery.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Delivery result = deliveryService.createDelivery(request, "user@example.com");

        assertEquals("user@example.com", result.getCustomerEmail());
        assertEquals("EXPRESS", result.getServiceType());
        assertEquals(250.0, result.getChargeAmount());
        assertEquals(DeliveryStatus.BOOKED, result.getStatus());
        assertNotNull(result.getTrackingNumber());
        assertNotNull(result.getCreatedAt());
        assertNotNull(result.getUpdatedAt());
    }

    @Test
    void updateStatusShouldPublishRabbitMessage() {
        Delivery delivery = new Delivery();
        delivery.setId(10L);
        delivery.setTrackingNumber("SC123");
        delivery.setCustomerEmail("user@example.com");

        when(deliveryRepository.findById(10L)).thenReturn(Optional.of(delivery));
        when(deliveryRepository.save(any(Delivery.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        StatusUpdateRequest request = new StatusUpdateRequest();
        request.setStatus(DeliveryStatus.DELIVERED);
        request.setDescription("Delivered at doorstep");

        deliveryService.updateStatus(10L, request);

        // Verification matches the hardcoded routing key in DeliveryService.java
        verify(rabbitTemplate).convertAndSend(
                any(),
                eq("tracking.update"),
                any(DeliveryStatusMessage.class));
    }

    @Test
    void cancelDeliveryShouldUpdateStatusToCancelled() {
        Delivery delivery = new Delivery();
        delivery.setId(12L);
        delivery.setCustomerEmail("user@example.com");
        delivery.setStatus(DeliveryStatus.BOOKED);
        delivery.setCreatedAt(LocalDateTime.now());

        when(deliveryRepository.findById(12L)).thenReturn(Optional.of(delivery));
        when(deliveryRepository.save(any(Delivery.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Delivery result = deliveryService.cancelDelivery(12L, "user@example.com");

        assertEquals(DeliveryStatus.CANCELLED, result.getStatus());
    }

    @Test
    void cancelDeliveryShouldThrowWhenEmailDoesNotMatch() {
        Delivery delivery = new Delivery();
        delivery.setCustomerEmail("owner@example.com");
        delivery.setStatus(DeliveryStatus.BOOKED);

        when(deliveryRepository.findById(13L)).thenReturn(Optional.of(delivery));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> deliveryService.cancelDelivery(13L, "other@example.com"));

        assertEquals("You can only cancel your own delivery", exception.getMessage());
    }

    @Test
    void cancelDeliveryShouldThrowWhenStatusIsNotBooked() {
        Delivery delivery = new Delivery();
        delivery.setCustomerEmail("user@example.com");
        delivery.setStatus(DeliveryStatus.IN_TRANSIT);

        when(deliveryRepository.findById(14L)).thenReturn(Optional.of(delivery));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> deliveryService.cancelDelivery(14L, "user@example.com"));

        assertEquals("Only BOOKED deliveries can be cancelled", exception.getMessage());
    }

    @Test
    void getByIdShouldThrowWhenMissing() {
        when(deliveryRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> deliveryService.getById(99L));

        assertEquals("Delivery not found with id: 99", exception.getMessage());
    }

    private DeliveryRequest buildRequest(String serviceType, double weight) {
        DeliveryRequest request = new DeliveryRequest();
        request.setSenderName("Sender");
        request.setSenderPhone("1234567890");
        request.setReceiverName("Receiver");
        request.setReceiverPhone("0987654321");
        request.setServiceType(serviceType);
        request.setPickupAddress(new Address());
        request.setDeliveryAddress(new Address());
        PackageDetails packageDetails = new PackageDetails();
        packageDetails.setWeightKg(weight);
        packageDetails.setDimensions("10x10x10");
        packageDetails.setPackageType("BOX");
        request.setPackageDetails(packageDetails);
        request.setScheduledPickupTime(LocalDateTime.now().plusDays(1));
        return request;
    }
}
	