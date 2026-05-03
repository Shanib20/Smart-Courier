package com.smartcourier.auth.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_deliveries")
public class UserDelivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String trackingNumber;
    
    private String userEmail;

    public UserDelivery() {}

    public UserDelivery(String trackingNumber, String userEmail) {
        this.trackingNumber = trackingNumber;
        this.userEmail = userEmail;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
}
