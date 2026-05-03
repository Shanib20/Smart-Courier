package com.smartcourier.auth.service;

import com.smartcourier.auth.dto.AuthResponse;
import com.smartcourier.auth.dto.LoginRequest;
import com.smartcourier.auth.dto.SignupRequest;
import com.smartcourier.auth.entity.User;
import com.smartcourier.auth.repository.UserRepository;
import com.smartcourier.auth.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    @Test
    void signupShouldCreateUserAndReturnToken() {
        SignupRequest request = new SignupRequest();
        request.setName("Alice");
        request.setEmail("alice@example.com");
        request.setPassword("secret123");
        request.setRole(User.Role.CUSTOMER);

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setName("Alice");
        savedUser.setEmail("alice@example.com");
        savedUser.setRole(User.Role.CUSTOMER);

        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtUtil.generateToken("alice@example.com", "CUSTOMER", 1L))
                .thenReturn("jwt-token");

        AuthResponse response = authService.signup(request);

        assertEquals("jwt-token", response.getToken());
        assertEquals("CUSTOMER", response.getRole());
        assertEquals("Alice", response.getName());
        assertEquals(1L, response.getUserId());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void signupShouldThrowWhenEmailAlreadyExists() {
        SignupRequest request = new SignupRequest();
        request.setEmail("alice@example.com");

        when(userRepository.existsByEmail("alice@example.com")).thenReturn(true);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> authService.signup(request));

        assertEquals("Email already registered. Please login.", exception.getMessage());
    }

    @Test
    void loginShouldReturnTokenForValidCredentials() {
        LoginRequest request = new LoginRequest();
        request.setEmail("alice@example.com");
        request.setPassword("secret123");

        User user = new User();
        user.setId(7L);
        user.setName("Alice");
        user.setEmail("alice@example.com");
        user.setPassword("encoded");
        user.setRole(User.Role.ADMIN);

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret123", "encoded")).thenReturn(true);
        when(jwtUtil.generateToken("alice@example.com", "ADMIN", 7L))
                .thenReturn("admin-token");

        AuthResponse response = authService.login(request);

        assertEquals("admin-token", response.getToken());
        assertEquals("ADMIN", response.getRole());
        assertEquals("Alice", response.getName());
        assertEquals(7L, response.getUserId());
    }

    @Test
    void loginShouldThrowWhenUserDoesNotExist() {
        LoginRequest request = new LoginRequest();
        request.setEmail("missing@example.com");
        request.setPassword("secret123");

        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> authService.login(request));

        assertEquals("No account found with this email.", exception.getMessage());
    }

    @Test
    void loginShouldThrowWhenPasswordDoesNotMatch() {
        LoginRequest request = new LoginRequest();
        request.setEmail("alice@example.com");
        request.setPassword("wrong-password");

        User user = new User();
        user.setEmail("alice@example.com");
        user.setPassword("encoded");

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "encoded")).thenReturn(false);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> authService.login(request));

        assertEquals("Incorrect password.", exception.getMessage());
    }
}
