package com.smartcourier.auth.controller;

import com.smartcourier.auth.dto.UpdatePasswordRequest;
import com.smartcourier.auth.dto.UpdateProfileRequest;
import com.smartcourier.auth.entity.User;
import com.smartcourier.auth.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

import com.smartcourier.auth.dto.AddressDto;
import com.smartcourier.auth.dto.AddressRequest;
import com.smartcourier.auth.dto.UserProfileResponse;
import com.smartcourier.auth.entity.Address;
import com.smartcourier.auth.repository.AddressRepository;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@RestController
@RequestMapping("/auth/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AddressRepository addressRepository;

    @GetMapping
    public ResponseEntity<UserProfileResponse> getProfile(@RequestHeader("X-User-Email") String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Address> addresses = addressRepository.findByUser(user);

        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setVerified(user.isVerified());
        response.setTwoFactorEnabled(user.isTwoFactorEnabled());
        response.setProfilePhoto(user.getProfilePhoto());

        List<AddressDto> addressDtos = addresses.stream().map(a -> {
            AddressDto dto = new AddressDto();
            dto.setId(a.getId());
            dto.setFullName(a.getFullName());
            dto.setPhone(a.getPhone());
            dto.setLine1(a.getLine1());
            dto.setLine2(a.getLine2());
            dto.setCity(a.getCity());
            dto.setState(a.getState());
            dto.setPincode(a.getPincode());
            dto.setLabel(a.getLabel());
            dto.setDefault(a.isDefaultAddress());
            dto.setUpdatedAt(a.getUpdatedAt());
            return dto;
        }).collect(Collectors.toList());

        response.setAddresses(addressDtos);

        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestHeader("X-User-Email") String email,
                                           @Valid @RequestBody UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setName(request.getName());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(@RequestHeader("X-User-Email") String email,
                                            @Valid @RequestBody UpdatePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    @PutMapping("/2fa")
    public ResponseEntity<?> toggle2FA(@RequestHeader("X-User-Email") String email,
                                       @RequestParam boolean enabled) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setTwoFactorEnabled(enabled);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "2FA " + (enabled ? "enabled" : "disabled") + " successfully"));
    }

    @PostMapping("/photo")
    public ResponseEntity<?> updateProfilePhoto(
            @RequestHeader("X-User-Email") String email,
            @RequestBody Map<String, String> request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setProfilePhoto(request.get("photoBase64"));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profile photo updated successfully"));
    }

    @PostMapping("/addresses")
    public ResponseEntity<?> addAddress(
            @RequestHeader("X-User-Email") String email,
            @Valid @RequestBody AddressRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.isDefault()) {
            resetDefaultAddresses(user);
        } else {
            List<Address> existing = addressRepository.findByUser(user);
            if (existing.isEmpty()) request.setDefault(true);
        }

        Address address = new Address();
        address.setUser(user);
        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setLine1(request.getLine1());
        address.setLine2(request.getLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPincode(request.getPincode());
        address.setLabel(request.getLabel());
        address.setDefaultAddress(request.isDefault());

        addressRepository.save(address);
        return ResponseEntity.status(201).body(Map.of("message", "Address added successfully"));
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<?> updateAddress(
            @RequestHeader("X-User-Email") String email,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        
        if (!address.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        }

        if (request.isDefault() && !address.isDefaultAddress()) {
            resetDefaultAddresses(user);
        }

        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setLine1(request.getLine1());
        address.setLine2(request.getLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPincode(request.getPincode());
        address.setLabel(request.getLabel());
        address.setDefaultAddress(request.isDefault());

        addressRepository.save(address);
        return ResponseEntity.ok(Map.of("message", "Address updated successfully"));
    }

    @DeleteMapping
    public ResponseEntity<?> deleteAccount(
            @RequestHeader("X-User-Email") String email,
            @RequestBody Map<String, String> request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String password = request.get("password");
        if (password == null || !passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Incorrect password. Verification failed."));
        }

        // Delete associated addresses first
        List<Address> addresses = addressRepository.findByUser(user);
        addressRepository.deleteAll(addresses);

        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<?> deleteAddress(
            @RequestHeader("X-User-Email") String email,
            @PathVariable Long id) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        
        if (!address.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        }

        addressRepository.delete(address);
        return ResponseEntity.ok(Map.of("message", "Address deleted successfully"));
    }

    private void resetDefaultAddresses(User user) {
        List<Address> defaultAddresses = addressRepository.findByUserAndDefaultAddressTrue(user);
        for (Address addr : defaultAddresses) {
            addr.setDefaultAddress(false);
            addressRepository.save(addr);
        }
    }
}
