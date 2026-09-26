package com.puspo.notification.service;

public interface SmsService {
    void sendOtp(String mobileNumber, String otp, long ttlSeconds);
}