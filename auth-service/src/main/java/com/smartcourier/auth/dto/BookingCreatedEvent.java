package com.smartcourier.auth.dto;

import java.time.LocalDateTime;

public class BookingCreatedEvent {
    private String trackingNumber;
    private String customerEmail;
    private String senderName;
    private String receiverName;
    private Double chargeAmount;
    private LocalDateTime estimatedDeliveryDate;

    public BookingCreatedEvent() {}

    public BookingCreatedEvent(String trackingNumber, String customerEmail, String senderName, String receiverName, Double chargeAmount, LocalDateTime estimatedDeliveryDate) {
        this.trackingNumber = trackingNumber;
        this.customerEmail = customerEmail;
        this.senderName = senderName;
        this.receiverName = receiverName;
        this.chargeAmount = chargeAmount;
        this.estimatedDeliveryDate = estimatedDeliveryDate;
    }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }
    public Double getChargeAmount() { return chargeAmount; }
    public void setChargeAmount(Double chargeAmount) { this.chargeAmount = chargeAmount; }
    public LocalDateTime getEstimatedDeliveryDate() { return estimatedDeliveryDate; }
    public void setEstimatedDeliveryDate(LocalDateTime estimatedDeliveryDate) { this.estimatedDeliveryDate = estimatedDeliveryDate; }
}
