package com.puspo.notification.event;

public record UserRegisteredEvent(String userId, String customerId, String username, String email) {}