package com.smartcourier.delivery.dto;

import com.smartcourier.delivery.entity.DeliveryStatus;

public class StatusUpdateRequest {
    private DeliveryStatus status;
    private String description;

    public StatusUpdateRequest() {}

    public DeliveryStatus getStatus() { return status; }
    public void setStatus(DeliveryStatus status) { this.status = status; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
