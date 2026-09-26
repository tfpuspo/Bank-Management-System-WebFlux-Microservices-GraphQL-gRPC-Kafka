package com.puspo.notification.event;

public record OtpRequestedEvent(String customerId, String mobileNumber, String otp, long ttlSeconds) {}