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
            Map<String, Object> analytics = deliveryClient.getAnalyticsSummary(7); // Match 'Reports' default range
            Map<String, Object> statsMap = (Map<String, Object>) analytics.get("stats");
            
            long total = statsMap != null ? ((Number) statsMap.getOrDefault("TOTAL", 0)).longValue() : 0;
            long booked = statsMap != null ? ((Number) statsMap.getOrDefault("BOOKED", 0)).longValue() : 0;
            long inTransit = statsMap != null ? ((Number) statsMap.getOrDefault("IN_TRANSIT", 0)).longValue() : 0;
            long delivered = statsMap != null ? ((Number) statsMap.getOrDefault("DELIVERED", 0)).longValue() : 0;
            long failed = statsMap != null ? ((Number) statsMap.getOrDefault("FAILED", 0)).longValue() : 0;
            
            List<Map<String, Object>> hubPerformance = (List<Map<String, Object>>) analytics.get("hubPerformance");
            long totalHubs = hubPerformance != null ? hubPerformance.size() : hubRepository.count();

            // Calculate Revenue from trend data (sum of all points in the range)
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
            return ds;
        } catch (Exception e) {
            log.error("Failed to fetch analytics for dashboard: {}", e.getMessage());
            // Fallback to basic counts if analytics fails
            List<Map<String, Object>> deliveries = getAllDeliveriesFromService();
            return new DashboardStats(
                    deliveries.size(), 0, 0, 0, 0, hubRepository.count(), 0.0);
        }
    }

    public List<Map<String, Object>> getRecentDeliveries() {
        List<Map<String, Object>> all = getAllDeliveriesFromService();
        return all.stream()
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
                id, status, "ADMIN", "admin@smartcourier.com");
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
