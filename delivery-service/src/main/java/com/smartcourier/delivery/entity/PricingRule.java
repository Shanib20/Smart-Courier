package com.smartcourier.delivery.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "pricing_rules")
public class PricingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "from_pincode_prefix", nullable = false, length = 6)
    private String fromPincodePrefix;

    @Column(name = "to_pincode_prefix", nullable = false, length = 6)
    private String toPincodePrefix;

    @Column(name = "base_price", nullable = false)
    private BigDecimal basePrice;

    @Column(name = "rate_per_kg", nullable = false)
    private BigDecimal ratePerKg;

    @Column(name = "min_weight_kg", nullable = false)
    private BigDecimal minWeightKg;

    @Column(name = "estimated_days", nullable = false)
    private Integer estimatedDays;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    public PricingRule() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFromPincodePrefix() { return fromPincodePrefix; }
    public void setFromPincodePrefix(String fromPincodePrefix) { this.fromPincodePrefix = fromPincodePrefix; }
    public String getToPincodePrefix() { return toPincodePrefix; }
    public void setToPincodePrefix(String toPincodePrefix) { this.toPincodePrefix = toPincodePrefix; }
    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
    public BigDecimal getRatePerKg() { return ratePerKg; }
    public void setRatePerKg(BigDecimal ratePerKg) { this.ratePerKg = ratePerKg; }
    public BigDecimal getMinWeightKg() { return minWeightKg; }
    public void setMinWeightKg(BigDecimal minWeightKg) { this.minWeightKg = minWeightKg; }
    public Integer getEstimatedDays() { return estimatedDays; }
    public void setEstimatedDays(Integer estimatedDays) { this.estimatedDays = estimatedDays; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}
