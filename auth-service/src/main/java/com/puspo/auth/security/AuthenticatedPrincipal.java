package com.puspo.auth.security;

import java.util.List;
import java.util.UUID;

public record AuthenticatedPrincipal(UUID userId, UUID subjectId, String subjectType, List<String> roles) {
}