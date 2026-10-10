package com.puspo.notification.event;

// userId = database UUID of the user; loginUserId = the ID they log in with (e.g. UI10000001)
public record UserRegisteredEvent(
        String userId, String customerId, String username, String email, String loginUserId) {}