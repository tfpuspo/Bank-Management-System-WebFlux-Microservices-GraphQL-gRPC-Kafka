package com.puspo.auth.event;

import java.util.UUID;

public record UserRegisteredPayload(String userId, UUID customerId, String username, String email) {}