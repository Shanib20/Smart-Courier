package com.smartcourier.gateway.controller;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SwaggerUiConfigControllerTest {

    @Test
    void swaggerConfigShouldExposeAllServiceDocs() {
        SwaggerUiConfigController controller = new SwaggerUiConfigController();

        Map<String, Object> config = controller.swaggerConfig();

        assertEquals("/v3/api-docs/swagger-config", config.get("configUrl"));
        assertEquals(true, config.get("disableSwaggerDefaultUrl"));
        assertEquals("auth-service", config.get("urls.primaryName"));
        assertEquals(4, ((List<?>) config.get("urls")).size());
    }
}
