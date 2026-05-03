package com.smartcourier.tracking.repository;

import com.smartcourier.tracking.entity.DeliveryProof;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeliveryProofRepository
        extends JpaRepository<DeliveryProof, Long> {

    Optional<DeliveryProof> findByTrackingNumber(
            String trackingNumber);
}