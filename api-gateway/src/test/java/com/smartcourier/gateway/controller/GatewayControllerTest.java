package com.smartcourier.gateway.controller;

import com.smartcourier.gateway.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GatewayControllerTest {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private GatewayController gatewayController;

    @Mock
    private HttpServletRequest request;

    @Test
    void authDocsShouldReturnProxyResponse() {
        ReflectionTestUtils.setField(gatewayController, "authServiceUrl", "http://localhost:8081");
        when(restTemplate.exchange(
                eq("http://localhost:8081/v3/api-docs"),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(String.class)))
                .thenReturn(ResponseEntity.ok("{\"openapi\":\"3.0.1\"}"));

        ResponseEntity<String> response = gatewayController.authDocs();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("{\"openapi\":\"3.0.1\"}", response.getBody());
    }

    @Test
    void routeDeliveryShouldReturnUnauthorizedWhenTokenMissing() {
        ReflectionTestUtils.setField(gatewayController, "deliveryServiceUrl", "http://localhost:8082");
        when(request.getRequestURI()).thenReturn("/gateway/deliveries/all");
        when(request.getHeader("Authorization")).thenReturn(null);

        ResponseEntity<String> response = gatewayController.routeDelivery(request, null);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("{\"message\":\"Missing token\",\"status\":401}", response.getBody());
    }

    @Test
    void routeAuthShouldForwardWithoutToken() {
        ReflectionTestUtils.setField(gatewayController, "authServiceUrl", "http://localhost:8081");
        when(request.getRequestURI()).thenReturn("/gateway/auth/login");
        when(request.getMethod()).thenReturn("POST");
        when(request.getQueryString()).thenReturn(null);
        when(restTemplate.exchange(
                eq("http://localhost:8081/auth/login"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(String.class)))
                .thenReturn(ResponseEntity.ok("{\"token\":\"abc\"}"));

        ResponseEntity<String> response = gatewayController.routeAuth(request, "{}");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("{\"token\":\"abc\"}", response.getBody());
    }

    @Test
    void routeDeliveryShouldForwardWhenTokenIsValid() {
        ReflectionTestUtils.setField(gatewayController, "deliveryServiceUrl", "http://localhost:8082");
        when(request.getRequestURI()).thenReturn("/gateway/deliveries/my");
        when(request.getMethod()).thenReturn("GET");
        when(request.getQueryString()).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn("Bearer token");
        when(jwtUtil.isTokenValid("token")).thenReturn(true);
        when(jwtUtil.extractEmail("token")).thenReturn("user@example.com");
        when(jwtUtil.extractRole("token")).thenReturn("CUSTOMER");
        when(restTemplate.exchange(
                eq("http://localhost:8082/deliveries/my"),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(String.class)))
                .thenReturn(ResponseEntity.ok("[]"));

        ResponseEntity<String> response = gatewayController.routeDelivery(request, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("[]", response.getBody());
    }

    @Test
    void uploadDocumentShouldReturnUnauthorizedWhenTokenMissing() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "invoice.pdf", "application/pdf", "data".getBytes());

        ResponseEntity<String> response = gatewayController.uploadDocument(file, "SC123", null);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }
}
