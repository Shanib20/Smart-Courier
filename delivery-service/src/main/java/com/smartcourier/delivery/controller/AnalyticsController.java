package com.smartcourier.delivery.controller;

import com.smartcourier.delivery.dto.AnalyticsResponse;
import com.smartcourier.delivery.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/deliveries/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsResponse> getSummary(@RequestParam(defaultValue = "7") int range) {
        return ResponseEntity.ok(analyticsService.getSummary(range));
    }
}
