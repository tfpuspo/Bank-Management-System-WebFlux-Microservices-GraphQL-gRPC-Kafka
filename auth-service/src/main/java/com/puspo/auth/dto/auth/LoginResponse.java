package com.puspo.auth.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class LoginResponse {
    private String token;
    private UUID id;
    private String userId;
    private String userType;
    private UUID customerId;
    private List<String> roles;
    private List<String> permissions;
    private long expiresInSeconds;
}