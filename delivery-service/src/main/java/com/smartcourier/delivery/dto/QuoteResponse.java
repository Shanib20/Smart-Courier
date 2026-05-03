package com.smartcourier.delivery.dto;

public class QuoteResponse {
    private java.math.BigDecimal basePrice;
    private java.math.BigDecimal ratePerKg;
    private java.math.BigDecimal totalAmount;
    private Integer estimatedDays;
    private String matchType; // EXACT_MATCH, ZONE_MATCH, FALLBACK
    private Long ruleId;

    public java.math.BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(java.math.BigDecimal basePrice) { this.basePrice = basePrice; }
    public java.math.BigDecimal getRatePerKg() { return ratePerKg; }
    public void setRatePerKg(java.math.BigDecimal ratePerKg) { this.ratePerKg = ratePerKg; }
    public java.math.BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(java.math.BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public Integer getEstimatedDays() { return estimatedDays; }
    public void setEstimatedDays(Integer estimatedDays) { this.estimatedDays = estimatedDays; }
    public String getMatchType() { return matchType; }
    public void setMatchType(String matchType) { this.matchType = matchType; }
    public Long getRuleId() { return ruleId; }
    public void setRuleId(Long ruleId) { this.ruleId = ruleId; }
}
