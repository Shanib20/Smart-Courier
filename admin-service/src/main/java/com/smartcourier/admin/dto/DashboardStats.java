package com.smartcourier.admin.dto;

public class DashboardStats {
    private long totalDeliveries;
    private long bookedCount;
    private long inTransitCount;
    private long deliveredCount;
    private long failedCount;
    private long totalHubs;
    private double totalRevenue;
    private java.util.List<java.util.Map<String, Object>> revenueTrend;
    
    // Dynamic Trends
    private String revenueTrendLabel;
    private String revenueTrendType; 
    private String activeTrendLabel;
    private String activeTrendType;
    private String pendingTrendLabel;
    private String pendingTrendType;
    private String totalTrendLabel;
    private String totalTrendType;
    private String hubsTrendLabel;
    private String hubsTrendType;

    public DashboardStats() {}

    public DashboardStats(long totalDeliveries, long bookedCount, long inTransitCount, 
                          long deliveredCount, long failedCount, long totalHubs, double totalRevenue) {
        this.totalDeliveries = totalDeliveries;
        this.bookedCount = bookedCount;
        this.inTransitCount = inTransitCount;
        this.deliveredCount = deliveredCount;
        this.failedCount = failedCount;
        this.totalHubs = totalHubs;
        this.totalRevenue = totalRevenue;
    }

    public long getTotalDeliveries() { return totalDeliveries; }
    public void setTotalDeliveries(long totalDeliveries) { this.totalDeliveries = totalDeliveries; }
    public long getBookedCount() { return bookedCount; }
    public void setBookedCount(long bookedCount) { this.bookedCount = bookedCount; }
    public long getInTransitCount() { return inTransitCount; }
    public void setInTransitCount(long inTransitCount) { this.inTransitCount = inTransitCount; }
    public long getDeliveredCount() { return deliveredCount; }
    public void setDeliveredCount(long deliveredCount) { this.deliveredCount = deliveredCount; }
    public long getFailedCount() { return failedCount; }
    public void setFailedCount(long failedCount) { this.failedCount = failedCount; }
    public long getTotalHubs() { return totalHubs; }
    public void setTotalHubs(long totalHubs) { this.totalHubs = totalHubs; }
    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }
    public java.util.List<java.util.Map<String, Object>> getRevenueTrend() { return revenueTrend; }
    public void setRevenueTrend(java.util.List<java.util.Map<String, Object>> revenueTrend) { this.revenueTrend = revenueTrend; }

    public String getRevenueTrendLabel() { return revenueTrendLabel; }
    public void setRevenueTrendLabel(String l) { this.revenueTrendLabel = l; }
    public String getRevenueTrendType() { return revenueTrendType; }
    public void setRevenueTrendType(String t) { this.revenueTrendType = t; }

    public String getActiveTrendLabel() { return activeTrendLabel; }
    public void setActiveTrendLabel(String l) { this.activeTrendLabel = l; }
    public String getActiveTrendType() { return activeTrendType; }
    public void setActiveTrendType(String t) { this.activeTrendType = t; }

    public String getPendingTrendLabel() { return pendingTrendLabel; }
    public void setPendingTrendLabel(String l) { this.pendingTrendLabel = l; }
    public String getPendingTrendType() { return pendingTrendType; }
    public void setPendingTrendType(String t) { this.pendingTrendType = t; }

    public String getTotalTrendLabel() { return totalTrendLabel; }
    public void setTotalTrendLabel(String l) { this.totalTrendLabel = l; }
    public String getTotalTrendType() { return totalTrendType; }
    public void setTotalTrendType(String t) { this.totalTrendType = t; }

    public String getHubsTrendLabel() { return hubsTrendLabel; }
    public void setHubsTrendLabel(String l) { this.hubsTrendLabel = l; }
    public String getHubsTrendType() { return hubsTrendType; }
    public void setHubsTrendType(String t) { this.hubsTrendType = t; }
}
