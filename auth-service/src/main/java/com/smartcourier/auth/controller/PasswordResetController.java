package com.smartcourier.auth.controller;

import com.smartcourier.auth.dto.ForgotPasswordRequest;
import com.smartcourier.auth.dto.ResetPasswordRequest;
import com.smartcourier.auth.entity.PasswordResetToken;
import com.smartcourier.auth.entity.User;
import com.smartcourier.auth.repository.PasswordResetTokenRepository;
import com.smartcourier.auth.repository.UserRepository;
import com.smartcourier.auth.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class PasswordResetController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/forgot-password")
    @Transactional
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            // Return success even if user not found to prevent email enumeration attacks
            return ResponseEntity.ok(Map.of("message", "If an account with that email exists, a reset link has been sent."));
        }

        User user = userOpt.get();

        // Rate limiting check: No more than 1 request per 5 minutes
        Optional<PasswordResetToken> latestToken = tokenRepository.findTopByUserOrderByExpiryDateDesc(user);
        if (latestToken.isPresent()) {
            LocalDateTime createdTime = latestToken.get().getExpiryDate().minusMinutes(30);
            if (createdTime.plusMinutes(5).isAfter(LocalDateTime.now())) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(Map.of("message", "Please wait 5 minutes before requesting another reset link."));
            }
        }

        // Delete any existing tokens for this user
        tokenRepository.deleteByUser(user);

        // Generate new token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user, LocalDateTime.now().plusMinutes(30));
        tokenRepository.save(resetToken);

        // Send Email
        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);

        return ResponseEntity.ok(Map.of("message", "If an account with that email exists, a reset link has been sent."));
    }

    @PostMapping("/reset-password")
    @Transactional
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(request.getToken());

        if (tokenOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid or expired reset token."));
        }

        PasswordResetToken resetToken = tokenOpt.get();

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.deleteByToken(resetToken.getToken());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Token has expired. Please request a new one."));
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Atomic delete of the token once used
        tokenRepository.deleteByToken(resetToken.getToken());

        return ResponseEntity.ok(Map.of("message", "Password has been reset successfully."));
    }
}
