package com.smartcourier.auth.controller;

import com.smartcourier.auth.dto.AuthResponse;
import com.smartcourier.auth.dto.LoginRequest;
import com.smartcourier.auth.dto.SignupRequest;
import com.smartcourier.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(
    		
    		
            @Valid @RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
        
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
    		
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(
            @Valid @RequestBody com.smartcourier.auth.dto.OtpVerificationRequest request) {
        return ResponseEntity.ok(authService.verifyEmail(request.getEmail(), request.getOtp()));
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<AuthResponse> verify2FA(
            @Valid @RequestBody com.smartcourier.auth.dto.OtpVerificationRequest request) {
        return ResponseEntity.ok(authService.verify2FA(request.getEmail(), request.getOtp()));
    }

    @PostMapping("/force-change-password")
    public ResponseEntity<?> forceChangePassword(@RequestBody java.util.Map<String, String> request) {
        return ResponseEntity.ok(authService.forceChangePassword(request.get("email"), request.get("oldPassword"), request.get("newPassword")));
    }
}