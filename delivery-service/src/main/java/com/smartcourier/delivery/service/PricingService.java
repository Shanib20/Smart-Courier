package com.smartcourier.delivery.service;

import com.smartcourier.delivery.dto.QuoteResponse;
import com.smartcourier.delivery.entity.PricingRule;
import com.smartcourier.delivery.repository.PricingRuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class PricingService {

    @Autowired
    private PricingRuleRepository pricingRuleRepository;

    public QuoteResponse calculateQuote(String fromPincode, String toPincode, BigDecimal weight) {
        List<PricingRule> activeRules = pricingRuleRepository.findByIsActiveTrue();

        // 1. Exact Match (6 digits)
        Optional<PricingRule> exactMatch = activeRules.stream()
                .filter(r -> r.getFromPincodePrefix().equals(fromPincode) && r.getToPincodePrefix().equals(toPincode))
                .findFirst();

        if (exactMatch.isPresent()) {
            return generateQuote(exactMatch.get(), weight, "EXACT_MATCH");
        }

        // 2. Zone Match (first 3 digits) - Skip if it looks like an international marker
        if (fromPincode != null && fromPincode.length() >= 3 && toPincode != null && toPincode.length() >= 3) {
            if (fromPincode.startsWith("INT") || toPincode.startsWith("INT")) {
                // Skip zone matching for international markers to avoid "INT" zone collisions
            } else {
                String fromZone = fromPincode.substring(0, 3);
                String toZone = toPincode.substring(0, 3);

                Optional<PricingRule> zoneMatch = activeRules.stream()
                        .filter(r -> r.getFromPincodePrefix().equals(fromZone) && r.getToPincodePrefix().equals(toZone))
                        .findFirst();

                if (zoneMatch.isPresent()) {
                    return generateQuote(zoneMatch.get(), weight, "ZONE_MATCH");
                }
            }
        }

        // 3. Universal Fallback
        QuoteResponse fallback = new QuoteResponse();
        BigDecimal base = new BigDecimal("100.00");
        BigDecimal ratePerKg = new BigDecimal("50.00");
        
        // International pricing logic based on markers
        if ("INT-USA".equals(toPincode)) {
            base = new BigDecimal("2500.00");
            ratePerKg = new BigDecimal("800.00");
        } else if ("INT-UK".equals(toPincode)) {
            base = new BigDecimal("2200.00");
            ratePerKg = new BigDecimal("750.00");
        } else if ("INT-CAN".equals(toPincode)) {
            base = new BigDecimal("2400.00");
            ratePerKg = new BigDecimal("780.00");
        } else if ("INT-UAE".equals(toPincode)) {
            base = new BigDecimal("1500.00");
            ratePerKg = new BigDecimal("600.00");
        } else if ("INT-SA".equals(toPincode) || "999999".equals(toPincode)) {
            base = new BigDecimal("1100.00");
            ratePerKg = new BigDecimal("550.00");
        }
        
        BigDecimal extraWeight = weight.subtract(BigDecimal.ONE);
        if (extraWeight.compareTo(BigDecimal.ZERO) < 0) {
            extraWeight = BigDecimal.ZERO;
        }

        BigDecimal total = base.add(extraWeight.multiply(ratePerKg));

        fallback.setBasePrice(base);
        fallback.setRatePerKg(ratePerKg);
        fallback.setTotalAmount(total);
        fallback.setEstimatedDays(7);
        fallback.setMatchType("FALLBACK");

        return fallback;
    }

    private QuoteResponse generateQuote(PricingRule rule, BigDecimal weight, String matchType) {
        QuoteResponse quote = new QuoteResponse();
        
        BigDecimal chargeableWeight = weight.max(rule.getMinWeightKg());
        BigDecimal extraWeight = chargeableWeight.subtract(rule.getMinWeightKg());
        if (extraWeight.compareTo(BigDecimal.ZERO) < 0) {
            extraWeight = BigDecimal.ZERO;
        }

        BigDecimal total = rule.getBasePrice().add(extraWeight.multiply(rule.getRatePerKg()));

        quote.setBasePrice(rule.getBasePrice());
        quote.setRatePerKg(rule.getRatePerKg());
        quote.setTotalAmount(total);
        quote.setEstimatedDays(rule.getEstimatedDays());
        quote.setMatchType(matchType);
        quote.setRuleId(rule.getId());

        return quote;
    }
}
