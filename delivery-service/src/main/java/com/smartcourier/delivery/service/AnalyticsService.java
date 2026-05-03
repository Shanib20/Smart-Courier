package com.smartcourier.delivery.service;

import com.smartcourier.delivery.dto.AnalyticsResponse;
import com.smartcourier.delivery.repository.AnalyticsRepository;
import com.smartcourier.delivery.repository.HubRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final AnalyticsRepository analyticsRepository;
    private final HubRepository hubRepository;

    public AnalyticsService(AnalyticsRepository analyticsRepository, HubRepository hubRepository) {
        this.analyticsRepository = analyticsRepository;
        this.hubRepository = hubRepository;
    }

    public AnalyticsResponse getSummary(int days) {
        AnalyticsResponse response = new AnalyticsResponse();

        // 1. Status Counts
        List<Object[]> statusData = analyticsRepository.getStatusCounts(days);
        Map<String, Long> stats = new HashMap<>();
        long total = 0;
        long delivered = 0;
        long cancelled = 0;
        
        for (Object[] row : statusData) {
            String status = (String) row[0];
            long count = ((Number) row[1]).longValue();
            stats.put(status, count);
            total += count;
            if ("DELIVERED".equals(status)) delivered = count;
            if ("CANCELLED".equals(status)) cancelled = count;
        }
        stats.put("TOTAL", total);
        response.setStats(stats);

        // 2. Calculations
        if (total > 0) {
            response.setSuccessRate(Math.round((delivered * 100.0 / total) * 10) / 10.0);
            response.setCancellationRate(Math.round((cancelled * 100.0 / total) * 10) / 10.0);
        }

        Double avgDays = analyticsRepository.getAvgDeliveryDays(days);
        response.setAvgDeliveryDays(avgDays != null ? Math.round(avgDays * 10) / 10.0 : 0.0);

        // 3. Revenue Trend
        List<Object[]> revenueData = analyticsRepository.getRevenueTrend(days);
        List<AnalyticsResponse.RevenuePoint> trend = revenueData.stream()
                .map(row -> {
                    String date = row[0] != null ? row[0].toString() : "N/A";
                    BigDecimal amount = row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO;
                    return new AnalyticsResponse.RevenuePoint(date, amount);
                })
                .collect(Collectors.toList());
        response.setRevenueTrend(trend);

        // 4. Top Routes
        List<Object[]> routeData = analyticsRepository.getTopRoutes(days);
        List<AnalyticsResponse.RouteStat> routes = routeData.stream()
                .map(row -> {
                    String from = row[0] != null ? row[0].toString() : "Unknown";
                    String to = row[1] != null ? row[1].toString() : "Unknown";
                    long count = row[2] != null ? ((Number) row[2]).longValue() : 0L;
                    BigDecimal rev = row[3] != null ? new BigDecimal(row[3].toString()) : BigDecimal.ZERO;
                    return new AnalyticsResponse.RouteStat(from, to, count, rev);
                })
                .collect(Collectors.toList());
        response.setTopRoutes(routes);

        // 5. Hub Performance (Real Data from Hubs table)
        response.setHubPerformance(hubRepository.findAll().stream()
                .limit(5)
                .map(h -> new AnalyticsResponse.HubMetric(
                        h.getName(), 
                        0L, // Volume tracking to be implemented
                        h.getStatus().name().equals("ACTIVE") ? "Healthy" : "Maintenance"))
                .collect(Collectors.toList()));

        // 6. Real Customer Count placeholder (returns 0 for now)
        response.setNewCustomers(0L);

        return response;
    }
}
