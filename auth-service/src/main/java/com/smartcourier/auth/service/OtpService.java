package com.smartcourier.auth.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    // Simple in-memory storage for OTPs (email -> otp)
    // In production, use Redis or a database with expiration
    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();

    public String generateOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStorage.put(email, otp);
        return otp;
    }

    public boolean validateOtp(String email, String otp) {
        String storedOtp = otpStorage.get(email);
        if (storedOtp != null && storedOtp.equals(otp)) {
            otpStorage.remove(email); // Invalidate OTP after use
            return true;
        }
        return false;
    }

    public void clearOtp(String email) {
        otpStorage.remove(email);
    }
}
