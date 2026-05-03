package com.smartcourier.delivery.controller;

import com.smartcourier.delivery.dto.UserActivityResponse;
import com.smartcourier.delivery.entity.Delivery;
import com.smartcourier.delivery.entity.DeliveryStatus;
import com.smartcourier.delivery.repository.DeliveryRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/deliveries")
public class UserActivityController {

    private final DeliveryRepository deliveryRepository;

    public UserActivityController(DeliveryRepository deliveryRepository) {
        this.deliveryRepository = deliveryRepository;
    }

    @GetMapping("/user-activity")
    public UserActivityResponse getActivity(@RequestParam String email) {
        long total = deliveryRepository.countByCustomerEmail(email);
        
        List<DeliveryStatus> activeStatuses = List.of(
            DeliveryStatus.BOOKED, 
            DeliveryStatus.PICKED_UP, 
            DeliveryStatus.IN_TRANSIT, 
            DeliveryStatus.OUT_FOR_DELIVERY
        );
        long active = deliveryRepository.countByCustomerEmailAndStatusIn(email, activeStatuses);
        
        java.time.LocalDateTime lastDate = deliveryRepository
            .findFirstByCustomerEmailOrderByCreatedAtDesc(email)
            .map(Delivery::getCreatedAt)
            .orElse(null);

        return new UserActivityResponse(total, active, lastDate);
    }
}
