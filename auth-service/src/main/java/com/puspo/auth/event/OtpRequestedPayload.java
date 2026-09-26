package com.puspo.auth.event;

import java.util.UUID;

public record OtpRequestedPayload(UUID customerId, String mobileNumber, String otp, long ttlSeconds) {}