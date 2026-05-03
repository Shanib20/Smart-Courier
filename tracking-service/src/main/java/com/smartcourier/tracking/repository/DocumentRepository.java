package com.smartcourier.tracking.repository;

import com.smartcourier.tracking.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository
        extends JpaRepository<Document, Long> {

    List<Document> findByTrackingNumber(String trackingNumber);
}