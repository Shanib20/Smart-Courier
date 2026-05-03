package com.smartcourier.admin.dto;

import java.util.Map;

public record HealthStatusResponse(
    String systemStatus,
    Map<String, String> services,
    long timestamp
) {}
