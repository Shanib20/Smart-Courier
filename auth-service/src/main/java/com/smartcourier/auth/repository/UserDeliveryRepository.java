package com.smartcourier.auth.repository;

import com.smartcourier.auth.entity.UserDelivery;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserDeliveryRepository extends JpaRepository<UserDelivery, Long> {
    Optional<UserDelivery> findByTrackingNumber(String trackingNumber);
}
