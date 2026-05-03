package com.smartcourier.delivery.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "deliveries", indexes = {
    @Index(name = "idx_delivery_tracking", columnList = "trackingNumber"),
    @Index(name = "idx_delivery_cust_email", columnList = "customerEmail"),
    @Index(name = "idx_delivery_created", columnList = "createdAt")
})
public class Delivery {

    public Delivery() {}

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String trackingNumber;
    private String customerEmail;
    private String senderName;
    private String senderPhone;
    private String receiverName;
    private String receiverPhone;
    private String serviceType; // DOMESTIC, EXPRESS, INTERNATIONAL

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private DeliveryStatus status = DeliveryStatus.BOOKED;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "street",
            column = @Column(name = "pickup_street")),
        @AttributeOverride(name = "city",
            column = @Column(name = "pickup_city")),
        @AttributeOverride(name = "state",
            column = @Column(name = "pickup_state")),
        @AttributeOverride(name = "pincode",
            column = @Column(name = "pickup_pincode")),
        @AttributeOverride(name = "country",
            column = @Column(name = "pickup_country"))
    })
    private Address pickupAddress;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "street",
            column = @Column(name = "delivery_street")),
        @AttributeOverride(name = "city",
            column = @Column(name = "delivery_city")),
        @AttributeOverride(name = "state",
            column = @Column(name = "delivery_state")),
        @AttributeOverride(name = "pincode",
            column = @Column(name = "delivery_pincode")),
        @AttributeOverride(name = "country",
            column = @Column(name = "delivery_country"))
    })
    private Address deliveryAddress;

    @Embedded
    private PackageDetails packageDetails;

    private Double chargeAmount;

    private LocalDateTime scheduledPickupTime;
    private LocalDateTime estimatedDeliveryDate;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getTrackingNumber() {
		return trackingNumber;
	}

	public void setTrackingNumber(String trackingNumber) {
		this.trackingNumber = trackingNumber;
	}

	public String getCustomerEmail() {
		return customerEmail;
	}

	public void setCustomerEmail(String customerEmail) {
		this.customerEmail = customerEmail;
	}

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

	public DeliveryStatus getStatus() {
		return status;
	}

	public void setStatus(DeliveryStatus status) {
		this.status = status;
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

	public Double getChargeAmount() {
		return chargeAmount;
	}

	public void setChargeAmount(Double chargeAmount) {
		this.chargeAmount = chargeAmount;
	}

	public LocalDateTime getScheduledPickupTime() {
		return scheduledPickupTime;
	}

	public void setScheduledPickupTime(LocalDateTime scheduledPickupTime) {
		this.scheduledPickupTime = scheduledPickupTime;
	}

	public LocalDateTime getEstimatedDeliveryDate() {
		return estimatedDeliveryDate;
	}

	public void setEstimatedDeliveryDate(LocalDateTime estimatedDeliveryDate) {
		this.estimatedDeliveryDate = estimatedDeliveryDate;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
}