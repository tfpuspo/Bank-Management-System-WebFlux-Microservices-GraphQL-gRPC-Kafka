package com.puspo.notification.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.puspo.notification.event.OtpRequestedEvent;
import com.puspo.notification.service.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OtpEventListener {

    private final SmsService smsService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "${app.kafka.topic.otp-requested}", groupId = "notification-service")
    public void onOtpRequested(String message) {
        try {
            OtpRequestedEvent event = objectMapper.readValue(message, OtpRequestedEvent.class);
            smsService.sendOtp(event.mobileNumber(), event.otp(), event.ttlSeconds());
        } catch (Exception ex) {
            log.error("Failed to process OtpRequested event: {}", message, ex);
        }
    }
}