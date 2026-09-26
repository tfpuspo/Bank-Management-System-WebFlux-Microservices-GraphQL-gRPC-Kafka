package com.puspo.notification.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.puspo.notification.event.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserRegisteredListener {

    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "${app.kafka.topic.user-registered}", groupId = "notification-service")
    public void onUserRegistered(String message) {
        try {
            UserRegisteredEvent event = objectMapper.readValue(message, UserRegisteredEvent.class);
            log.info("[STUB SMS/EMAIL] Welcome {} — your account (customer {}) is now active.",
                    event.username(), event.customerId());
        } catch (Exception ex) {
            log.error("Failed to process UserRegistered event: {}", message, ex);
        }
    }
}