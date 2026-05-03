package com.smartcourier.auth.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDateTime;

@FeignClient(name = "delivery-service")
public interface DeliveryServiceClient {

    @GetMapping("/deliveries/user-activity")
    UserActivity getActivity(@RequestParam("email") String email);

    record UserActivity(
        long totalBookings,
        long activeBookings,
        LocalDateTime lastBookingDate
    ) {}
}
