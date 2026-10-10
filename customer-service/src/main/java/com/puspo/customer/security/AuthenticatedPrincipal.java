package com.puspo.customer.security;

import java.util.List;
import java.util.UUID;

public record AuthenticatedPrincipal(UUID userId, UUID subjectId, String subjectType, List<String> roles) {
    public boolean hasRole(String role) {
        return roles != null && roles.contains(role);
    }
}