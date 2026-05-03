package com.smartcourier.gateway.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
public class SwaggerUiConfigController {

    @GetMapping(value = "/v3/api-docs/swagger-config",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> swaggerConfig() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("configUrl", "/v3/api-docs/swagger-config");
        response.put("disableSwaggerDefaultUrl", true);
        response.put("persistAuthorization", true);
        response.put("urls", List.of(
                Map.of("name", "auth-service", "url", "/gateway/auth/v3/api-docs"),
                Map.of("name", "delivery-service", "url", "/gateway/deliveries/v3/api-docs"),
                Map.of("name", "tracking-service", "url", "/gateway/tracking/v3/api-docs"),
                Map.of("name", "admin-service", "url", "/gateway/admin/v3/api-docs")
        ));
        response.put("urls.primaryName", "auth-service");
        return response;
    }
}
