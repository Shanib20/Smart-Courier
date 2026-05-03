package com.smartcourier.auth.service;

import com.smartcourier.auth.dto.AuthResponse;
import com.smartcourier.auth.dto.LoginRequest;
import com.smartcourier.auth.dto.SignupRequest;
import com.smartcourier.auth.entity.User;
import com.smartcourier.auth.repository.UserRepository;
import com.smartcourier.auth.security.JwtUtil;
import com.smartcourier.auth.entity.AccountStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered. Please login.");
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.CUSTOMER); // Force Customer Role for public signups
        user.setVerified(false);
        user.setTwoFactorEnabled(false);
        user.setStatus(AccountStatus.ACTIVE);
        User savedUser = userRepository.save(user);

        // Generate OTP and Send Email
        String otp = otpService.generateOtp(savedUser.getEmail());
        emailService.sendOtpEmail(savedUser.getEmail(), otp);

        // Return AuthResponse with requiresOtp = true
        return new AuthResponse(true, savedUser.getRole().name(),
                                savedUser.getName(), savedUser.getId(), savedUser.getProfilePhoto());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account found with this email."));
        
        if (user.getStatus() == AccountStatus.SUSPENDED) {
            throw new RuntimeException("Your account has been suspended. Please contact support.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect password.");
        }
        if (!user.isVerified()) {
            String otp = otpService.generateOtp(user.getEmail());
            emailService.sendOtpEmail(user.getEmail(), otp);
            return new AuthResponse(true, user.getRole().name(),
                                    user.getName(), user.getId(), user.getProfilePhoto());
        }
        if (user.isTwoFactorEnabled()) {
            String otp = otpService.generateOtp(user.getEmail());
            emailService.sendOtpEmail(user.getEmail(), otp);
            return new AuthResponse(true, user.getRole().name(),
                                    user.getName(), user.getId(), user.getProfilePhoto());
        }

        if (user.isPasswordChangeRequired()) {
            return new AuthResponse(false, true, user.getRole().name(), user.getName(), user.getId(), user.getProfilePhoto());
        }

        String token = jwtUtil.generateToken(
            user.getEmail(), user.getRole().name(), user.getId());
        return new AuthResponse(token, user.getRole().name(),
                                user.getName(), user.getId(), user.getProfilePhoto());
    }

    public String verifyEmail(String email, String otp) {
        if (!otpService.validateOtp(email, otp)) {
            throw new RuntimeException("Invalid or expired OTP");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerified(true);
        userRepository.save(user);
        return "Email verified successfully";
    }

    public AuthResponse verify2FA(String email, String otp) {
        if (!otpService.validateOtp(email, otp)) {
            throw new RuntimeException("Invalid or expired OTP");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isVerified()) {
            user.setVerified(true);
            userRepository.save(user);
        }

        if (user.isPasswordChangeRequired()) {
            return new AuthResponse(false, true, user.getRole().name(), user.getName(), user.getId(), user.getProfilePhoto());
        }

        String token = jwtUtil.generateToken(
            user.getEmail(), user.getRole().name(), user.getId());
        return new AuthResponse(token, user.getRole().name(),
                                user.getName(), user.getId(), user.getProfilePhoto());
    }

    public void createAdmin(String email, String name) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }
        
        String tempPassword = "Admin@" + (int)(Math.random() * 9000 + 1000);
        User admin = new User();
        admin.setEmail(email);
        admin.setName(name);
        admin.setPassword(passwordEncoder.encode(tempPassword));
        admin.setRole(User.Role.ADMIN);
        admin.setVerified(true); // Admins are pre-verified
        admin.setPasswordChangeRequired(true);
        admin.setStatus(AccountStatus.ACTIVE);
        userRepository.save(admin);
        
        emailService.sendAdminWelcomeEmail(email, name, tempPassword);
    }

    public java.util.Map<String, String> forceChangePassword(String email, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email."));
        
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Incorrect temporary password.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordChangeRequired(false);
        userRepository.save(user);

        return java.util.Map.of("message", "Password updated successfully. You can now log in.");
    }
}