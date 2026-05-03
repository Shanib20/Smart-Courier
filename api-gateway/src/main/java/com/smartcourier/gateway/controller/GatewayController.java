package com.smartcourier.gateway.controller;

import com.smartcourier.gateway.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/gateway")
public class GatewayController {

    private static final List<String> PUBLIC_PATHS = List.of(
            "/gateway/auth/signup",
            "/gateway/auth/login",
            "/gateway/auth/verify-email",
            "/gateway/auth/verify-2fa",
            "/gateway/auth/forgot-password",
            "/gateway/auth/reset-password",
            "/gateway/auth/force-change-password",
            "/gateway/auth/v3/api-docs",
            "/gateway/deliveries/v3/api-docs",
            "/gateway/tracking/v3/api-docs",
            "/gateway/admin/v3/api-docs",
            "/gateway/tracking/public"
    );

    private final RestTemplate restTemplate;
    private final JwtUtil jwtUtil;

    @Value("${smartcourier.routing.auth-base-url}")
    private String authServiceUrl;

    @Value("${smartcourier.routing.delivery-base-url}")
    private String deliveryServiceUrl;

    @Value("${smartcourier.routing.tracking-base-url}")
    private String trackingServiceUrl;

    @Value("${smartcourier.routing.admin-base-url}")
    private String adminServiceUrl;

    public GatewayController(RestTemplate restTemplate, JwtUtil jwtUtil) {
        this.restTemplate = restTemplate;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping(value = "/auth/v3/api-docs", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> authDocs() {
        return fetchApiDocs(authServiceUrl);
    }

    @GetMapping(value = "/deliveries/v3/api-docs", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> deliveryDocs() {
        return fetchApiDocs(deliveryServiceUrl);
    }

    @GetMapping(value = "/tracking/v3/api-docs", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> trackingDocs() {
        return fetchApiDocs(trackingServiceUrl);
    }

    @GetMapping(value = "/admin/v3/api-docs", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> adminDocs() {
        return fetchApiDocs(adminServiceUrl);
    }

    @RequestMapping("/auth/**")
    public ResponseEntity<String> routeAuth(
            HttpServletRequest request,
            @RequestBody(required = false) String body) {
        return forward(request, body, authServiceUrl, true);
    }

    @RequestMapping("/deliveries/**")
    public ResponseEntity<String> routeDelivery(
            HttpServletRequest request,
            @RequestBody(required = false) String body) {
        return forward(request, body, deliveryServiceUrl, true);
    }

    @RequestMapping("/tracking/**")
    public ResponseEntity<String> routeTracking(
            HttpServletRequest request,
            @RequestBody(required = false) String body) {
        return forward(request, body, trackingServiceUrl, true);
    }

    @RequestMapping("/admin/**")
    public ResponseEntity<String> routeAdmin(
            HttpServletRequest request,
            @RequestBody(required = false) String body) {
        return forward(request, body, adminServiceUrl, true);
    }

    @PostMapping("/tracking/documents/upload")
    public ResponseEntity<String> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("trackingNumber") String trackingNumber,
            @RequestHeader(value = "Authorization", required = false)
            String authHeader) {

        AuthContext authContext = authenticate(authHeader);
        if (authContext.errorResponse() != null) {
            return authContext.errorResponse();
        }

        try {
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", fileResource);
            body.add("trackingNumber", trackingNumber);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.set("X-User-Email", authContext.email());
            headers.set("X-User-Role", authContext.role());

            return restTemplate.exchange(
                    trackingServiceUrl + "/tracking/documents/upload",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    String.class);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\":\"Upload failed: "
                            + e.getMessage() + "\",\"status\":500}");
        }
    }

    private ResponseEntity<String> fetchApiDocs(String serviceUrl) {
        try {
            return restTemplate.exchange(
                    serviceUrl + "/v3/api-docs",
                    HttpMethod.GET,
                    new HttpEntity<>(new HttpHeaders()),
                    String.class);
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("{\"message\":\"Unable to load API docs from "
                            + serviceUrl + ": " + e.getMessage() + "\",\"status\":503}");
        }
    }

    private ResponseEntity<String> forward(HttpServletRequest request,
                                           String body,
                                           String serviceUrl,
                                           boolean requiresAuth) {
        String requestUri = request.getRequestURI();
        String servicePath = requestUri.replaceFirst("/gateway", "");
        String targetUrl = serviceUrl + servicePath;

        if (request.getQueryString() != null) {
            targetUrl += "?" + request.getQueryString();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        if (requiresAuth && !isPublicPath(requestUri)) {
            AuthContext authContext =
                    authenticate(request.getHeader("Authorization"));
            if (authContext.errorResponse() != null) {
                return authContext.errorResponse();
            }
            headers.set("X-User-Email", authContext.email());
            headers.set("X-User-Role", authContext.role());
            headers.set("Authorization", request.getHeader("Authorization"));
        }

        try {
            HttpMethod method = HttpMethod.valueOf(request.getMethod());
            return restTemplate.exchange(
                    targetUrl,
                    method,
                    new HttpEntity<>(body, headers),
                    String.class);
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("{\"message\":\"Service unavailable: "
                            + e.getMessage() + "\",\"status\":503}");
        }
    }

    private boolean isPublicPath(String requestUri) {
        // Allow public tracking GET requests (e.g., /gateway/tracking/SC-2026-123456)
        if (requestUri.matches("/gateway/tracking/SC-[A-Z0-9-]+")) {
            return true;
        }
        return PUBLIC_PATHS.stream().anyMatch(requestUri::startsWith);
    }

    private AuthContext authenticate(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return new AuthContext(null, null,
                    ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body("{\"message\":\"Missing token\",\"status\":401}"));
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.isTokenValid(token)) {
            return new AuthContext(null, null,
                    ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body("{\"message\":\"Invalid or expired token\",\"status\":401}"));
        }

        return new AuthContext(
                jwtUtil.extractEmail(token),
                jwtUtil.extractRole(token),
                null);
    }

    private record AuthContext(
            String email,
            String role,
            ResponseEntity<String> errorResponse) {
    }
}
