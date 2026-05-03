package com.smartcourier.admin.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(name = "delivery-service", path = "/deliveries")
public interface DeliveryClient {

    @GetMapping("/all")
    Map<String, Object> getAllDeliveries(
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Email") String email);

    @PutMapping("/{id}/status")
    Map<String, Object> updateStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") String status,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Email") String email);

    @GetMapping("/analytics/summary")
    Map<String, Object> getAnalyticsSummary(@RequestParam("range") int range);
}
