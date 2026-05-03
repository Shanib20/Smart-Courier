package com.smartcourier.admin.service;

import com.smartcourier.admin.client.DeliveryClient;
import com.smartcourier.admin.dto.DashboardStats;
import com.smartcourier.admin.dto.HubRequest;
import com.smartcourier.admin.entity.Hub;
import com.smartcourier.admin.repository.HubRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private static final Logger log =
            LoggerFactory.getLogger(AdminService.class);

    private final HubRepository hubRepository;
    private final DeliveryClient deliveryClient;

    public AdminService(HubRepository hubRepository,
                        DeliveryClient deliveryClient) {
        this.hubRepository = hubRepository;
        this.deliveryClient = deliveryClient;
    }

    public DashboardStats getDashboardStats() {
        log.info("Fetching dashboard stats from analytics");

        try {
            Map<String, Object> analytics = deliveryClient.getAnalyticsSummary(7); 
            Map<String, Object> statsMap = (Map<String, Object>) analytics.get("stats");
            
            // Get Absolute Total Deliveries (not just last 7 days)
            List<Map<String, Object>> allDeliveries = getAllDeliveriesFromService();
            long total = allDeliveries.size();
            
            long booked = countByStatus(allDeliveries, "BOOKED");
            long inTransit = countByStatus(allDeliveries, "IN_TRANSIT") + countByStatus(allDeliveries, "PICKED_UP") + countByStatus(allDeliveries, "OUT_FOR_DELIVERY");
            long delivered = countByStatus(allDeliveries, "DELIVERED");
            long failed = countByStatus(allDeliveries, "FAILED") + countByStatus(allDeliveries, "CANCELLED");
            
            // Always use the real local Hub count (Active only)
            long totalHubs = hubRepository.countByActiveTrue();

            // Calculate Revenue from trend data
            List<Map<String, Object>> trend = (List<Map<String, Object>>) analytics.get("revenueTrend");
            double revenue = 0;
            if (trend != null) {
                revenue = trend.stream()
                        .mapToDouble(p -> ((Number) p.get("amount")).doubleValue())
                        .sum();
            }

            DashboardStats ds = new DashboardStats(
                    total, booked, inTransit, delivered, failed, totalHubs, revenue);
            ds.setRevenueTrend(trend);

            // Dynamic Trend Calculations
            if (trend != null && trend.size() >= 2) {
                double latest = ((Number) trend.get(trend.size() - 1).get("amount")).doubleValue();
                double previous = ((Number) trend.get(trend.size() - 2).get("amount")).doubleValue();
                double diff = latest - previous;
                double percent = previous > 0 ? (diff / previous) * 100 : 0;
                ds.setRevenueTrendLabel(String.format("%s%.1f%%", diff >= 0 ? "+" : "", percent));
                ds.setRevenueTrendType(diff >= 0 ? "positive" : "negative");
            } else {
                ds.setRevenueTrendLabel("Stable");
                ds.setRevenueTrendType("neutral");
            }

            // Shipments Trend (Simulated based on current vs total)
            ds.setActiveTrendLabel(inTransit > 0 ? "+4.2%" : "0.0%");
            ds.setActiveTrendType(inTransit > 0 ? "positive" : "neutral");
            
            ds.setPendingTrendLabel(booked > 5 ? "+2.1%" : "Stable");
            ds.setPendingTrendType("neutral");

            ds.setTotalTrendLabel(String.format("+%d", total));
            ds.setTotalTrendType("positive");

            // Hubs Trend
            ds.setHubsTrendLabel(totalHubs > 0 ? "Healthy" : "Active");
            ds.setHubsTrendType("positive");

            return ds;
        } catch (Exception e) {
            log.error("Failed to fetch analytics for dashboard: {}", e.getMessage());
            // Fallback to basic counts if analytics fails
            List<Map<String, Object>> deliveries = getAllDeliveriesFromService();
            return new DashboardStats(
                    deliveries.size(), 0, 0, 0, 0, hubRepository.countByActiveTrue(), 0.0);
        }
    }

    public List<Map<String, Object>> getRecentDeliveries() {
        List<Map<String, Object>> all = getAllDeliveriesFromService();
        return all.stream()
                .sorted((a, b) -> {
                    Long idA = ((Number) a.getOrDefault("id", 0L)).longValue();
                    Long idB = ((Number) b.getOrDefault("id", 0L)).longValue();
                    return idB.compareTo(idA);
                })
                .limit(5)
                .toList();
    }

    public com.smartcourier.admin.dto.HealthStatusResponse getSystemHealth() {
        String[] services = {"auth-service", "delivery-service", "tracking-service", "api-gateway"};
        String[] urls = {
            "http://localhost:8081/actuator/health",
            "http://localhost:8082/actuator/health",
            "http://localhost:8083/actuator/health",
            "http://localhost:8080/actuator/health"
        };

        java.util.Map<String, String> statusMap = new java.util.HashMap<>();
        boolean overallHealthy = true;

        for (int i = 0; i < services.length; i++) {
            try {
                org.springframework.http.ResponseEntity<Map> response = 
                    new org.springframework.web.client.RestTemplate().getForEntity(urls[i], Map.class);
                String status = response.getBody().get("status").toString();
                statusMap.put(services[i], status);
                if (!"UP".equals(status)) overallHealthy = false;
            } catch (Exception e) {
                statusMap.put(services[i], "DOWN");
                overallHealthy = false;
            }
        }

        return new com.smartcourier.admin.dto.HealthStatusResponse(
            overallHealthy ? "HEALTHY" : "DEGRADED",
            statusMap,
            System.currentTimeMillis()
        );
    }

    public List<Map<String, Object>> getAllDeliveries() {
        log.info("Admin fetching all deliveries");
        return getAllDeliveriesFromService();
    }

    public Map<String, Object> resolveDelivery(Long id, String action) {
        log.info("Resolving delivery id: {} with action: {}", id, action);

        String status = switch (action.toUpperCase()) {
            case "RETRY" -> "BOOKED";
            case "RETURN" -> "RETURNED";
            case "FAIL" -> "FAILED";
            default -> throw new RuntimeException(
                    "Invalid action. Use: RETRY, RETURN, FAIL");
        };

        return deliveryClient.updateStatus(
                id, Map.of("status", status), "ADMIN", "admin@smartcourier.com");
    }

    public Hub createHub(HubRequest request) {
        log.info("Creating hub: {}", request.getHubName());
        Hub hub = new Hub();
        hub.setHubName(request.getHubName());
        hub.setCity(request.getCity());
        hub.setState(request.getState());
        hub.setPincode(request.getPincode());
        hub.setManagerName(request.getManagerName());
        hub.setContactNumber(request.getContactNumber());
        return hubRepository.save(hub);
    }

    public List<Hub> getAllHubs() {
        return hubRepository.findAll();
    }

    public List<Hub> getActiveHubs() {
        return hubRepository.findByActiveTrue();
    }

    public Hub deactivateHub(Long id) {
        Hub hub = hubRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Hub not found: " + id));
        hub.setActive(false);
        return hubRepository.save(hub);
    }

    public Map<String, Object> getReports() {
        log.info("Generating reports");
        List<Map<String, Object>> deliveries = getAllDeliveriesFromService();

        long total = deliveries.size();
        long delivered = countByStatus(deliveries, "DELIVERED");
        long failed = countByStatus(deliveries, "FAILED");
        long returned = countByStatus(deliveries, "RETURNED");
        long inTransit = countByStatus(deliveries, "IN_TRANSIT");

        double successRate = total > 0
                ? (double) delivered / total * 100 : 0;

        return Map.of(
                "totalDeliveries", total,
                "delivered", delivered,
                "failed", failed,
                "returned", returned,
                "inTransit", inTransit,
                "successRatePercent",
                Math.round(successRate * 100.0) / 100.0
        );
    }

    private List<Map<String, Object>> getAllDeliveriesFromService() {
        try {
            Map<String, Object> response = deliveryClient
                    .getAllDeliveries("ADMIN", "admin@smartcourier.com");
            
            if (response != null && response.containsKey("content")) {
                return (List<Map<String, Object>>) response.get("content");
            }
            return List.of();
        } catch (Exception e) {
            log.error("Could not fetch deliveries: {}", e.getMessage());
            return List.of();
        }
    }

    private long countByStatus(
            List<Map<String, Object>> deliveries, String status) {
        return deliveries.stream()
                .filter(d -> status.equals(d.get("status")))
                .count();
    }
}
