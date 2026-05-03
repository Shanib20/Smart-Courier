package com.smartcourier.auth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("Courier System <" + fromEmail + ">");
        message.setTo(toEmail);
        message.setSubject("Your OTP Code");
        message.setText("Your verification code is: " + otp + "\n\nPlease do not share this code with anyone.");
        
        try {
            mailSender.send(message);
            System.out.println("OTP email sent successfully to " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send OTP email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("Courier System <" + fromEmail + ">");
        message.setTo(toEmail);
        message.setSubject("Password Reset Request");
        message.setText("We received a request to reset your password. Click the link below to reset it:\n\n" + 
                        resetLink + "\n\nThis link will expire in 30 minutes. If you did not request this, please ignore this email.");
        
        try {
            mailSender.send(message);
            System.out.println("Password reset email sent successfully to " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send password reset email to " + toEmail + ": " + e.getMessage());
        }
    }

    public void sendAdminWelcomeEmail(String toEmail, String name, String tempPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("Courier System <" + fromEmail + ">");
        message.setTo(toEmail);
        message.setSubject("Welcome to SwiftCourier Admin Portal");
        message.setText("Dear " + name + ",\n\n" +
                        "You have been invited as an Admin to the SwiftCourier system.\n\n" + 
                        "Your temporary password is: " + tempPassword + "\n\n" +
                        "Please log in and you will be prompted to change your password immediately.");
        
        try {
            mailSender.send(message);
            System.out.println("Admin welcome email sent successfully to " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send Admin welcome email to " + toEmail + ": " + e.getMessage());
        }
    }

    public void sendBookingConfirmationEmail(String toEmail, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("Courier System <" + fromEmail + ">");
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);
        
        try {
            mailSender.send(message);
            System.out.println("Booking confirmation email sent successfully to " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send booking confirmation email to " + toEmail + ": " + e.getMessage());
        }
    }
}
