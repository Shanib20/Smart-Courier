package com.smartcourier.delivery.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "hubs", indexes = {
    @Index(name = "idx_hub_code", columnList = "hubCode"),
    @Index(name = "idx_hub_pincode", columnList = "pincode")
})
public class Hub {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String hubCode;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String pincode;

    private String city;
    private String state;
    private String address;

    @Enumerated(EnumType.STRING)
    private HubStatus status = HubStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    private HubType hubType = HubType.STANDARD;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Hub() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getHubCode() { return hubCode; }
    public void setHubCode(String hubCode) { this.hubCode = hubCode; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public HubStatus getStatus() { return status; }
    public void setStatus(HubStatus status) { this.status = status; }
    public HubType getHubType() { return hubType; }
    public void setHubType(HubType hubType) { this.hubType = hubType; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
