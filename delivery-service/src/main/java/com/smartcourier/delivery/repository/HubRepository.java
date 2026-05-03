package com.smartcourier.delivery.repository;

import com.smartcourier.delivery.entity.Hub;
import com.smartcourier.delivery.entity.HubStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HubRepository extends JpaRepository<Hub, Long> {
    
    Optional<Hub> findByHubCode(String hubCode);
    
    List<Hub> findByStatus(HubStatus status);
    
    Optional<Hub> findByPincodeAndStatus(String pincode, HubStatus status);

    @Query("SELECT h FROM Hub h WHERE " +
           "LOWER(h.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(h.city) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "h.pincode LIKE CONCAT('%', :query, '%') OR " +
           "LOWER(h.hubCode) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Hub> searchHubs(String query, Pageable pageable);
}
