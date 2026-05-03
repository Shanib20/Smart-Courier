package com.smartcourier.delivery.repository;

import com.smartcourier.delivery.entity.Delivery;
import com.smartcourier.delivery.entity.DeliveryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeliveryRepository
        extends JpaRepository<Delivery, Long> {

    Page<Delivery> findByCustomerEmail(String email, Pageable pageable);

    Optional<Delivery> findByTrackingNumber(String trackingNumber);

    List<Delivery> findByStatus(DeliveryStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT d FROM Delivery d WHERE " +
            "LOWER(d.trackingNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(d.senderName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(d.receiverName) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Delivery> searchAll(String query, Pageable pageable);

    long countByCustomerEmail(String email);

    long countByCustomerEmailAndStatusIn(String email, List<DeliveryStatus> statuses);

    Optional<Delivery> findFirstByCustomerEmailOrderByCreatedAtDesc(String email);

    int deleteByTrackingNumberStartingWith(String prefix);
}