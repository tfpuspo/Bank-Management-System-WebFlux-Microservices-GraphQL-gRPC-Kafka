package com.puspo.auth.dto.auth;

public record FederatedUserNode(
        String id, String username, String email, String userType, String customerId, String userId) {
}