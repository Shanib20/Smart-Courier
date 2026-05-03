package com.smartcourier.delivery.controller;

import com.smartcourier.delivery.dto.HubDTO;
import com.smartcourier.delivery.entity.Hub;
import com.smartcourier.delivery.service.HubService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/deliveries/hubs")
public class HubController {

    private final HubService hubService;

    public HubController(HubService hubService) {
        this.hubService = hubService;
    }

    @GetMapping
    public ResponseEntity<Page<Hub>> getAll(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(hubService.getAllHubs(query, PageRequest.of(page, size)));
    }

    @GetMapping("/active")
    public ResponseEntity<List<HubDTO>> getActive() {
        return ResponseEntity.ok(hubService.getActiveHubs());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Hub hub) {
        try {
            Hub created = hubService.createHub(hub);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("CONFLICT")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage().split(":")[1]);
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<Hub> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(hubService.toggleStatus(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            hubService.deleteHub(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
