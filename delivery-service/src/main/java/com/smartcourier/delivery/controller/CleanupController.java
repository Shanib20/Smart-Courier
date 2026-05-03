package com.smartcourier.delivery.controller;

import com.smartcourier.delivery.repository.DeliveryRepository;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;

@RestController
@RequestMapping("/deliveries/admin/cleanup")
public class CleanupController {

    private final DeliveryRepository deliveryRepository;

    public CleanupController(DeliveryRepository deliveryRepository) {
        this.deliveryRepository = deliveryRepository;
    }

    @DeleteMapping("/mock-data")
    @Transactional
    public Map<String, String> cleanupMockData() {
        // This is a one-time utility to clear the database of demo records
        // It looks for any tracking numbers starting with 'SC-DEMO'
        int deletedCount = deliveryRepository.deleteByTrackingNumberStartingWith("SC-DEMO");
        return Map.of("message", "Deleted " + deletedCount + " mock records from database.");
    }
}
