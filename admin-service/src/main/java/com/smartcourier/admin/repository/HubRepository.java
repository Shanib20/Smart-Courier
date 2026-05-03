package com.smartcourier.admin.repository;

import com.smartcourier.admin.entity.Hub;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HubRepository extends JpaRepository<Hub, Long> {

    List<Hub> findByActiveTrue();
    List<Hub> findByCity(String city);
}