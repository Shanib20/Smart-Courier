package com.smartcourier.delivery.service;

import com.smartcourier.delivery.dto.HubDTO;
import com.smartcourier.delivery.entity.Hub;
import com.smartcourier.delivery.entity.HubStatus;
import com.smartcourier.delivery.repository.HubRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class HubService {

    private final HubRepository hubRepository;

    public HubService(HubRepository hubRepository) {
        this.hubRepository = hubRepository;
    }

    @Transactional
    public Hub createHub(Hub hub) {
        // Validation: Check for existing active hub with same pincode
        hubRepository.findByPincodeAndStatus(hub.getPincode(), HubStatus.ACTIVE)
            .ifPresent(h -> {
                throw new RuntimeException("CONFLICT:An active hub already exists for this pincode");
            });

        // Auto-generate hub code: HUB-{CITY_3}-{PINCODE}
        String cityPrefix = hub.getCity() != null && hub.getCity().length() >= 3 
            ? hub.getCity().substring(0, 3).toUpperCase(Locale.ROOT) 
            : "HUB";
        hub.setHubCode("HUB-" + cityPrefix + "-" + hub.getPincode());

        return hubRepository.save(hub);
    }

    public Page<Hub> getAllHubs(String query, Pageable pageable) {
        if (query != null && !query.trim().isEmpty()) {
            return hubRepository.searchHubs(query, pageable);
        }
        return hubRepository.findAll(pageable);
    }

    public List<HubDTO> getActiveHubs() {
        return hubRepository.findByStatus(HubStatus.ACTIVE).stream()
                .map(h -> new HubDTO(h.getId(), h.getHubCode(), h.getName(), h.getCity()))
                .collect(Collectors.toList());
    }

    @Transactional
    public Hub toggleStatus(Long id) {
        Hub hub = hubRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hub not found"));
        
        hub.setStatus(hub.getStatus() == HubStatus.ACTIVE ? HubStatus.INACTIVE : HubStatus.ACTIVE);
        return hubRepository.save(hub);
    }

    @Transactional
    public void deleteHub(Long id) {
        Hub hub = hubRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hub not found"));
        
        // In a real system, you would check if deliveries are linked here.
        // For this demo, we'll allow delete if inactive.
        if (hub.getStatus() == HubStatus.ACTIVE) {
            throw new RuntimeException("Cannot delete an ACTIVE hub. Deactivate it first.");
        }
        hubRepository.delete(hub);
    }

    @Transactional
    public Hub updateHub(Long id, Hub updates) {
        Hub hub = hubRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hub not found"));

        if (updates.getName() != null) hub.setName(updates.getName());
        if (updates.getHubType() != null) hub.setHubType(updates.getHubType());
        if (updates.getCity() != null) hub.setCity(updates.getCity());
        if (updates.getState() != null) hub.setState(updates.getState());
        if (updates.getAddress() != null) hub.setAddress(updates.getAddress());
        if (updates.getPincode() != null) hub.setPincode(updates.getPincode());

        return hubRepository.save(hub);
    }
}
