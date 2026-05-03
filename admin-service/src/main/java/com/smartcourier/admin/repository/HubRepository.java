package com.smartcourier.admin.repository;

import com.smartcourier.admin.entity.Hub;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HubRepository extends JpaRepository<Hub, Long> {

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(h) FROM Hub h WHERE h.active = true")
    long countByActiveTrue();
    
    List<Hub> findByActiveTrue();
    List<Hub> findByCity(String city);
}