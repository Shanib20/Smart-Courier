package com.smartcourier.tracking.service;

import com.smartcourier.tracking.dto.DeliveryProofRequest;
import com.smartcourier.tracking.dto.DeliveryStatusMessage;
import com.smartcourier.tracking.dto.TrackingEventRequest;
import com.smartcourier.tracking.entity.DeliveryProof;
import com.smartcourier.tracking.entity.Document;
import com.smartcourier.tracking.entity.TrackingEvent;
import com.smartcourier.tracking.repository.DeliveryProofRepository;
import com.smartcourier.tracking.repository.DocumentRepository;
import com.smartcourier.tracking.repository.TrackingEventRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TrackingServiceTest {

    @Mock
    private TrackingEventRepository eventRepository;

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private DeliveryProofRepository proofRepository;

    @InjectMocks
    private TrackingService trackingService;

    @TempDir
    Path tempDir;

    @Test
    void addEventShouldPersistTrackingEvent() {
        TrackingEventRequest request = new TrackingEventRequest();
        request.setTrackingNumber("SC123");
        request.setStatus("IN_TRANSIT");
        request.setLocation("Mumbai");
        request.setDescription("Package departed");

        when(eventRepository.save(any(TrackingEvent.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        TrackingEvent result = trackingService.addEvent(request);

        assertEquals("SC123", result.getTrackingNumber());
        assertEquals("IN_TRANSIT", result.getStatus());
        assertEquals("Mumbai", result.getLocation());
        assertNotNull(result.getEventTime());
    }

    @Test
    void addDeliveredEventShouldUseDestinationHubAndProvidedTime() {
        DeliveryStatusMessage message = new DeliveryStatusMessage();
        message.setTrackingNumber("SC999");
        message.setStatus("DELIVERED");
        message.setDescription("Delivered");
        message.setEventTime(LocalDateTime.of(2026, 3, 28, 10, 0));

        when(eventRepository.save(any(TrackingEvent.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        trackingService.addDeliveredEvent(message);

        verify(eventRepository).save(any(TrackingEvent.class));
    }

    @Test
    void uploadDocumentShouldStoreFileAndMetadata() throws IOException {
        ReflectionTestUtils.setField(trackingService, "uploadDir", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file", "invoice.pdf", "application/pdf", "pdf-content".getBytes());

        when(documentRepository.save(any(Document.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Document result = trackingService.uploadDocument(file, "SC100");

        assertEquals("SC100", result.getTrackingNumber());
        assertEquals("invoice.pdf", result.getFileName());
        assertEquals("application/pdf", result.getFileType());
        assertNotNull(result.getUploadedAt());
        Path savedPath = Path.of(result.getFilePath());
        assertTrue(Files.exists(savedPath));
    }

    @Test
    void addProofShouldPersistProof() {
        DeliveryProofRequest request = new DeliveryProofRequest();
        request.setTrackingNumber("SC321");
        request.setReceiverName("John");
        request.setRemarks("Received in good condition");

        when(proofRepository.save(any(DeliveryProof.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        DeliveryProof result = trackingService.addProof(request);

        assertEquals("SC321", result.getTrackingNumber());
        assertEquals("John", result.getReceiverName());
        assertNotNull(result.getDeliveredAt());
    }

    @Test
    void getProofShouldThrowWhenMissing() {
        when(proofRepository.findByTrackingNumber("SC404")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> trackingService.getProof("SC404"));

        assertEquals("Proof not found for: SC404", exception.getMessage());
    }
}
