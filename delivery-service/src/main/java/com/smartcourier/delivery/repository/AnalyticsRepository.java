package com.smartcourier.delivery.repository;

import com.smartcourier.delivery.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface AnalyticsRepository extends JpaRepository<Delivery, Long> {

    @Query(value = "SELECT status, COUNT(*) as count FROM deliveries " +
                   "WHERE created_at >= DATE_SUB(NOW(), INTERVAL :days DAY) " +
                   "GROUP BY status", nativeQuery = true)
    List<Object[]> getStatusCounts(@Param("days") int days);

    @Query(value = "SELECT " +
                   "CASE WHEN :days = 1 THEN DATE_FORMAT(created_at, '%H:00') ELSE DATE_FORMAT(created_at, '%Y-%m-%d') END as date, " +
                   "COALESCE(SUM(charge_amount), 0) as amount " +
                   "FROM deliveries " +
                   "WHERE status != 'CANCELLED' AND created_at >= DATE_SUB(NOW(), INTERVAL :days DAY) " +
                   "GROUP BY date " +
                   "ORDER BY MIN(created_at) ASC", nativeQuery = true)
    List<Object[]> getRevenueTrend(@Param("days") int days);

    @Query(value = "SELECT pickup_pincode, delivery_pincode, COUNT(*) as count, COALESCE(SUM(charge_amount), 0) as revenue " +
                   "FROM deliveries " +
                   "WHERE status != 'CANCELLED' AND created_at >= DATE_SUB(NOW(), INTERVAL :days DAY) " +
                   "GROUP BY pickup_pincode, delivery_pincode " +
                   "ORDER BY count DESC LIMIT 10", nativeQuery = true)
    List<Object[]> getTopRoutes(@Param("days") int days);

    @Query(value = "SELECT COALESCE(AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)), 0) / 24.0 " +
                   "FROM deliveries " +
                   "WHERE status = 'DELIVERED' AND created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)", nativeQuery = true)
    Double getAvgDeliveryDays(@Param("days") int days);
    
    @Query(value = "SELECT count(*) FROM hubs WHERE status = 'ACTIVE'", nativeQuery = true)
    long getActiveHubCount();
}
