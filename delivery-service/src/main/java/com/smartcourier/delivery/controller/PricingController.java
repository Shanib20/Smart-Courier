package com.smartcourier.delivery.controller;

import com.smartcourier.delivery.dto.QuoteResponse;
import com.smartcourier.delivery.entity.PricingRule;
import com.smartcourier.delivery.repository.PricingRuleRepository;
import com.smartcourier.delivery.service.PricingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/deliveries/pricing")
public class PricingController {

    @Autowired
    private PricingService pricingService;

    @Autowired
    private PricingRuleRepository pricingRuleRepository;

    // PUBLIC: Get a quote for a delivery
    @GetMapping("/quote")
    public ResponseEntity<QuoteResponse> getQuote(
            @RequestParam String fromPincode,
            @RequestParam String toPincode,
            @RequestParam BigDecimal weight) {
        return ResponseEntity.ok(pricingService.calculateQuote(fromPincode, toPincode, weight));
    }

    // ADMIN: Get all rules
    @GetMapping("/rules")
    public ResponseEntity<List<PricingRule>> getAllRules(
            @RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) throw new RuntimeException("Admins only");
        return ResponseEntity.ok(pricingRuleRepository.findAll());
    }

    // ADMIN: Create rule
    @PostMapping("/rules")
    public ResponseEntity<PricingRule> createRule(
            @RequestHeader("X-User-Role") String role,
            @RequestBody PricingRule rule) {
        if (!"ADMIN".equals(role)) throw new RuntimeException("Admins only");
        return ResponseEntity.ok(pricingRuleRepository.save(rule));
    }

    // ADMIN: Update rule
    @PutMapping("/rules/{id}")
    public ResponseEntity<PricingRule> updateRule(
            @RequestHeader("X-User-Role") String role,
            @PathVariable Long id,
            @RequestBody PricingRule ruleDetails) {
        if (!"ADMIN".equals(role)) throw new RuntimeException("Admins only");

        PricingRule rule = pricingRuleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rule not found"));

        rule.setFromPincodePrefix(ruleDetails.getFromPincodePrefix());
        rule.setToPincodePrefix(ruleDetails.getToPincodePrefix());
        rule.setBasePrice(ruleDetails.getBasePrice());
        rule.setRatePerKg(ruleDetails.getRatePerKg());
        rule.setMinWeightKg(ruleDetails.getMinWeightKg());
        rule.setEstimatedDays(ruleDetails.getEstimatedDays());
        rule.setActive(ruleDetails.isActive());

        return ResponseEntity.ok(pricingRuleRepository.save(rule));
    }

    // ADMIN: Delete rule
    @DeleteMapping("/rules/{id}")
    public ResponseEntity<?> deleteRule(
            @RequestHeader("X-User-Role") String role,
            @PathVariable Long id) {
        if (!"ADMIN".equals(role)) throw new RuntimeException("Admins only");
        pricingRuleRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
