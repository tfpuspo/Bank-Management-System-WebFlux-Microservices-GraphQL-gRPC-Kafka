package com.puspo.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Service
public class SmsServiceImpl implements SmsService {

    public record SentSms(String mobileNumber, String otp, long ttlSeconds, LocalDateTime sentAt) {}

    private final List<SentSms> sentMessages = new CopyOnWriteArrayList<>();

    @Override
    public void sendOtp(String mobileNumber, String otp, long ttlSeconds) {
        sentMessages.add(new SentSms(mobileNumber, otp, ttlSeconds, LocalDateTime.now()));
        log.info("[STUB SMS] To: {} | Message: Your verification code is {}. It expires in {} seconds.",
                mobileNumber, otp, ttlSeconds);
    }

    public List<SentSms> getSentMessages() {
        return Collections.unmodifiableList(sentMessages);
    }
}