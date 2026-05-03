package com.smartcourier.admin.dto;

public class DashboardStats {
    private long totalDeliveries;
    private long bookedCount;
    private long inTransitCount;
    private long deliveredCount;
    private long failedCount;
    private long totalHubs;

    public DashboardStats() {}

    public DashboardStats(long totalDeliveries, long bookedCount, long inTransitCount, 
                          long deliveredCount, long failedCount, long totalHubs) {
        this.totalDeliveries = totalDeliveries;
        this.bookedCount = bookedCount;
        this.inTransitCount = inTransitCount;
        this.deliveredCount = deliveredCount;
        this.failedCount = failedCount;
        this.totalHubs = totalHubs;
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
}
