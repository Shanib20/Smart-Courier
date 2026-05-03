package com.smartcourier.tracking.service;

import com.smartcourier.tracking.dto.BookingCreatedEvent;
import com.smartcourier.tracking.dto.DeliveryProofRequest;
import com.smartcourier.tracking.dto.DeliveryStatusMessage;
import com.smartcourier.tracking.dto.TrackingEventRequest;
import com.smartcourier.tracking.entity.DeliveryProof;
import com.smartcourier.tracking.entity.Document;
import com.smartcourier.tracking.entity.TrackingEvent;
import com.smartcourier.tracking.repository.DeliveryProofRepository;
import com.smartcourier.tracking.repository.DocumentRepository;
import com.smartcourier.tracking.repository.TrackingEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TrackingService {

    private static final Logger log =
            LoggerFactory.getLogger(TrackingService.class);

    private final TrackingEventRepository eventRepository;
    private final DocumentRepository documentRepository;
    private final DeliveryProofRepository proofRepository;
    private final RabbitTemplate rabbitTemplate;

    @Value("${smartcourier.rabbitmq.exchange}")
    private String exchange;

    @Value("${smartcourier.rabbitmq.routing-key}")
    private String routingKey;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public TrackingService(TrackingEventRepository eventRepository,
                           DocumentRepository documentRepository,
                           DeliveryProofRepository proofRepository,
                           RabbitTemplate rabbitTemplate) {
        this.eventRepository = eventRepository;
        this.documentRepository = documentRepository;
        this.proofRepository = proofRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    public TrackingEvent addEvent(TrackingEventRequest request) {
        log.info("Adding tracking event for: {}", request.getTrackingNumber());
        TrackingEvent event = new TrackingEvent();
        event.setTrackingNumber(request.getTrackingNumber());
        event.setStatus(request.getStatus());
        event.setLocation(request.getLocation());
        event.setDescription(request.getDescription());
        event.setEventTime(LocalDateTime.now());
        TrackingEvent savedEvent = eventRepository.save(event);

        // Notify user via RabbitMQ
        try {
            DeliveryStatusMessage statusUpdate = new DeliveryStatusMessage();
            statusUpdate.setTrackingNumber(savedEvent.getTrackingNumber());
            statusUpdate.setStatus(savedEvent.getStatus());
            statusUpdate.setDescription("Location: " + savedEvent.getLocation() + ". " + savedEvent.getDescription());
            statusUpdate.setEventTime(savedEvent.getEventTime());
            statusUpdate.setCustomerEmail(request.getCustomerEmail());
            
            rabbitTemplate.convertAndSend(exchange, routingKey, statusUpdate);
            log.info("Status update event published for: {}", savedEvent.getTrackingNumber());
        } catch (Exception e) {
            log.error("Failed to publish status update: {}", e.getMessage());
        }

        return savedEvent;
    }

    public void addDeliveredEvent(DeliveryStatusMessage message) {
        log.info("Creating async delivered event for: {}",
                message.getTrackingNumber());
        TrackingEvent event = new TrackingEvent();
        event.setTrackingNumber(message.getTrackingNumber());
        event.setStatus(message.getStatus());
        event.setLocation("Destination Hub");
        event.setDescription(message.getDescription());
        event.setEventTime(message.getEventTime() != null
                ? message.getEventTime() : LocalDateTime.now());
        eventRepository.save(event);
    }

    public List<TrackingEvent> getEvents(String trackingNumber) {
        log.info("Fetching events for tracking: {}", trackingNumber);
        return eventRepository
                .findByTrackingNumberOrderByEventTimeDesc(trackingNumber);
    }

    public Document uploadDocument(MultipartFile file,
                                   String trackingNumber)
            throws IOException {
        log.info("Uploading document for tracking: {}", trackingNumber);

        String fileName = trackingNumber + "_" + file.getOriginalFilename();
        Path dirPath = Paths.get(uploadDir);
        Files.createDirectories(dirPath);
        Path filePath = dirPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath,
                StandardCopyOption.REPLACE_EXISTING);

        Document doc = new Document();
        doc.setTrackingNumber(trackingNumber);
        doc.setFileName(file.getOriginalFilename());
        doc.setFilePath(filePath.toString());
        doc.setFileType(file.getContentType());
        doc.setUploadedAt(LocalDateTime.now());
        return documentRepository.save(doc);
    }

    public List<Document> getDocuments(String trackingNumber) {
        return documentRepository.findByTrackingNumber(trackingNumber);
    }

    public DeliveryProof addProof(DeliveryProofRequest request) {
        log.info("Adding delivery proof for: {}", request.getTrackingNumber());
        DeliveryProof proof = new DeliveryProof();
        proof.setTrackingNumber(request.getTrackingNumber());
        proof.setReceiverName(request.getReceiverName());
        proof.setRemarks(request.getRemarks());
        proof.setDeliveredAt(LocalDateTime.now());
        return proofRepository.save(proof);
    }

    public DeliveryProof getProof(String trackingNumber) {
        return proofRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new RuntimeException(
                        "Proof not found for: " + trackingNumber));
    }

    public void initializeTracking(BookingCreatedEvent event) {
        log.info("Initializing tracking for: {}", event.getTrackingNumber());
        TrackingEvent trackingEvent = new TrackingEvent();
        trackingEvent.setTrackingNumber(event.getTrackingNumber());
        trackingEvent.setStatus("BOOKED");
        trackingEvent.setLocation("System");
        trackingEvent.setDescription("Delivery booked by " + event.getSenderName());
        trackingEvent.setEventTime(LocalDateTime.now());
        eventRepository.save(trackingEvent);
    }
}
