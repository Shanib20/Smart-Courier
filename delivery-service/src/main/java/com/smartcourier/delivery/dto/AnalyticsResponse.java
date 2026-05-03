package com.smartcourier.delivery.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class AnalyticsResponse {
    private Map<String, Long> stats; // total, delivered, inTransit, cancelled
    private List<RevenuePoint> revenueTrend;
    private List<RouteStat> topRoutes;
    private List<HubMetric> hubPerformance;
    private long newCustomers;
    private double avgDeliveryDays;
    private double successRate;
    private double cancellationRate;

    public AnalyticsResponse() {}

    // Nested classes for structured data
    public static class RevenuePoint {
        private String date;
        private BigDecimal amount;
        public RevenuePoint(String date, BigDecimal amount) { this.date = date; this.amount = amount; }
        public String getDate() { return date; }
        public BigDecimal getAmount() { return amount; }
    }

    public static class RouteStat {
        private String fromPincode;
        private String toPincode;
        private long count;
        private BigDecimal revenue;
        public RouteStat(String fromPincode, String toPincode, long count, BigDecimal revenue) {
            this.fromPincode = fromPincode;
            this.toPincode = toPincode;
            this.count = count;
            this.revenue = revenue;
        }
        public String getFromPincode() { return fromPincode; }
        public String getToPincode() { return toPincode; }
        public long getCount() { return count; }
        public BigDecimal getRevenue() { return revenue; }
    }

    public static class HubMetric {
        private String hubName;
        private long volume;
        private String status; // Healthy, High Load
        public HubMetric(String hubName, long volume, String status) {
            this.hubName = hubName;
            this.volume = volume;
            this.status = status;
        }
        public String getHubName() { return hubName; }
        public long getVolume() { return volume; }
        public String getStatus() { return status; }
    }

    // Getters and Setters
    public Map<String, Long> getStats() { return stats; }
    public void setStats(Map<String, Long> stats) { this.stats = stats; }
    public List<RevenuePoint> getRevenueTrend() { return revenueTrend; }
    public void setRevenueTrend(List<RevenuePoint> revenueTrend) { this.revenueTrend = revenueTrend; }
    public List<RouteStat> getTopRoutes() { return topRoutes; }
    public void setTopRoutes(List<RouteStat> topRoutes) { this.topRoutes = topRoutes; }
    public List<HubMetric> getHubPerformance() { return hubPerformance; }
    public void setHubPerformance(List<HubMetric> hubPerformance) { this.hubPerformance = hubPerformance; }
    public long getNewCustomers() { return newCustomers; }
    public void setNewCustomers(long newCustomers) { this.newCustomers = newCustomers; }
    public double getAvgDeliveryDays() { return avgDeliveryDays; }
    public void setAvgDeliveryDays(double avgDeliveryDays) { this.avgDeliveryDays = avgDeliveryDays; }
    public double getSuccessRate() { return successRate; }
    public void setSuccessRate(double successRate) { this.successRate = successRate; }
    public double getCancellationRate() { return cancellationRate; }
    public void setCancellationRate(double cancellationRate) { this.cancellationRate = cancellationRate; }
}
