package com.smartcourier.admin.service;

import com.smartcourier.admin.client.DeliveryClient;
import com.smartcourier.admin.dto.DashboardStats;
import com.smartcourier.admin.dto.HubRequest;
import com.smartcourier.admin.entity.Hub;
import com.smartcourier.admin.repository.HubRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private HubRepository hubRepository;

    @Mock
    private DeliveryClient deliveryClient;

    @InjectMocks
    private AdminService adminService;

    @Test
    void getDashboardStatsShouldAggregateDeliveryCounts() {
        // Mock getAnalyticsSummary as used in current AdminService
        when(deliveryClient.getAnalyticsSummary(7))
                .thenReturn(Map.of(
                    "stats", Map.of(
                        "TOTAL", 4,
                        "BOOKED", 1,
                        "IN_TRANSIT", 1,
                        "DELIVERED", 1,
                        "FAILED", 1
                    ),
                    "hubPerformance", List.of(Map.of(), Map.of(), Map.of()),
                    "revenueTrend", List.of()
                ));

        DashboardStats stats = adminService.getDashboardStats();

        assertEquals(4L, stats.getTotalDeliveries());
        assertEquals(1L, stats.getBookedCount());
        assertEquals(3L, stats.getTotalHubs());
    }

    @Test
    void resolveDeliveryShouldDelegateMappedStatus() {
        when(deliveryClient.updateStatus(1L, Map.of("status", "BOOKED"), "ADMIN", "admin@smartcourier.com"))
                .thenReturn(Map.of("status", "BOOKED"));

        Map<String, Object> response = adminService.resolveDelivery(1L, "retry");

        assertEquals("BOOKED", response.get("status"));
    }

    @Test
    void resolveDeliveryShouldThrowOnInvalidAction() {
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> adminService.resolveDelivery(1L, "unknown"));

        assertEquals("Invalid action. Use: RETRY, RETURN, FAIL", exception.getMessage());
    }

    @Test
    void createHubShouldPersistHub() {
        HubRequest request = new HubRequest();
        request.setHubName("Central");
        request.setCity("Pune");
        request.setState("MH");
        request.setPincode("411001");
        request.setManagerName("Boss");
        request.setContactNumber("9999999999");

        when(hubRepository.save(any(Hub.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Hub hub = adminService.createHub(request);

        assertEquals("Central", hub.getHubName());
        assertEquals("Pune", hub.getCity());
    }

    @Test
    void deactivateHubShouldSetInactive() {
        Hub hub = new Hub();
        hub.setId(5L);
        hub.setActive(true);

        when(hubRepository.findById(5L)).thenReturn(Optional.of(hub));
        when(hubRepository.save(any(Hub.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Hub result = adminService.deactivateHub(5L);

        assertEquals(false, result.isActive());
    }

    @Test
    void getReportsShouldReturnCalculatedMetrics() {
        // Fix return type: getAllDeliveries returns a Map with a "content" list
        when(deliveryClient.getAllDeliveries("ADMIN", "admin@smartcourier.com"))
                .thenReturn(Map.of("content", List.of(
                        Map.of("status", "DELIVERED"),
                        Map.of("status", "FAILED"),
                        Map.of("status", "RETURNED"),
                        Map.of("status", "IN_TRANSIT")
                )));

        Map<String, Object> report = adminService.getReports();

        assertEquals(4L, report.get("totalDeliveries"));
        assertEquals(1L, report.get("delivered"));
        assertEquals(25.0, report.get("successRatePercent"));
    }
}
