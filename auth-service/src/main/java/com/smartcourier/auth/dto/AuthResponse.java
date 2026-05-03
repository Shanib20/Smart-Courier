package com.smartcourier.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AuthResponse {

    @JsonProperty("token")
    private String token;

    @JsonProperty("role")
    private String role;

    @JsonProperty("name")
    private String name;

    @JsonProperty("userId")
    private Long userId;

    @JsonProperty("requiresOtp")
    private boolean requiresOtp;

    @JsonProperty("requiresPasswordChange")
    private boolean requiresPasswordChange;

    public AuthResponse(String token, String role,
                        String name, Long userId) {
        this.token = token;
        this.role = role;
        this.name = name;
        this.userId = userId;
        this.requiresOtp = false;
        this.requiresPasswordChange = false;
    }

    public AuthResponse(boolean requiresOtp, String role, String name, Long userId) {
        this.requiresOtp = requiresOtp;
        this.role = role;
        this.name = name;
        this.userId = userId;
        this.requiresPasswordChange = false;
    }

    public AuthResponse(boolean requiresOtp, boolean requiresPasswordChange, String role, String name, Long userId) {
        this.requiresOtp = requiresOtp;
        this.requiresPasswordChange = requiresPasswordChange;
        this.role = role;
        this.name = name;
        this.userId = userId;
    }

    public String getToken() { return token; }
    public String getRole()  { return role;  }
    public String getName()  { return name;  }
    public Long getUserId()  { return userId; }
    public boolean isRequiresOtp() { return requiresOtp; }
    public boolean isRequiresPasswordChange() { return requiresPasswordChange; }
}