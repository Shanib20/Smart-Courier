package com.smartcourier.delivery.dto;

import com.smartcourier.delivery.entity.Address;
import com.smartcourier.delivery.entity.PackageDetails;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class DeliveryRequest {

    @NotBlank(message = "Sender name is required")
    private String senderName;

    @NotBlank(message = "Sender phone is required")
    private String senderPhone;

    @NotBlank(message = "Receiver name is required")
    private String receiverName;

    @NotBlank(message = "Receiver phone is required")
    private String receiverPhone;

    @NotBlank(message = "Service type is required")
    private String serviceType;

    @NotNull(message = "Pickup address is required")
    private Address pickupAddress;

    @NotNull(message = "Delivery address is required")
    private Address deliveryAddress;

    @NotNull(message = "Package details are required")
    private PackageDetails packageDetails;

    private LocalDateTime scheduledPickupTime;

	public String getSenderName() {
		return senderName;
	}

	public void setSenderName(String senderName) {
		this.senderName = senderName;
	}

	public String getSenderPhone() {
		return senderPhone;
	}

	public void setSenderPhone(String senderPhone) {
		this.senderPhone = senderPhone;
	}

	public String getReceiverName() {
		return receiverName;
	}

	public void setReceiverName(String receiverName) {
		this.receiverName = receiverName;
	}

	public String getReceiverPhone() {
		return receiverPhone;
	}

	public void setReceiverPhone(String receiverPhone) {
		this.receiverPhone = receiverPhone;
	}

	public String getServiceType() {
		return serviceType;
	}

	public void setServiceType(String serviceType) {
		this.serviceType = serviceType;
	}

	public Address getPickupAddress() {
		return pickupAddress;
	}

	public void setPickupAddress(Address pickupAddress) {
		this.pickupAddress = pickupAddress;
	}

	public Address getDeliveryAddress() {
		return deliveryAddress;
	}

	public void setDeliveryAddress(Address deliveryAddress) {
		this.deliveryAddress = deliveryAddress;
	}

	public PackageDetails getPackageDetails() {
		return packageDetails;
	}

	public void setPackageDetails(PackageDetails packageDetails) {
		this.packageDetails = packageDetails;
	}

	public LocalDateTime getScheduledPickupTime() {
		return scheduledPickupTime;
	}

	public void setScheduledPickupTime(LocalDateTime scheduledPickupTime) {
		this.scheduledPickupTime = scheduledPickupTime;
	}
    
}