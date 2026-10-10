package com.puspo.auth.serviceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.puspo.auth.dto.otp.GenerateOtpRequest;
import com.puspo.auth.dto.otp.GenerateOtpResponse;
import com.puspo.auth.dto.otp.VerifyOtpRequest;
import com.puspo.auth.dto.otp.VerifyOtpResponse;
import com.puspo.auth.entity.OutboxEvent;
import com.puspo.auth.event.OtpRequestedPayload;
import com.puspo.auth.repository.OutboxEventRepository;
import com.puspo.auth.service.OtpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final ReactiveStringRedisTemplate redisTemplate;
    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.otp.length:6}")
    private int otpLength;

    @Value("${app.otp.ttl-seconds:300}")
    private long ttlSeconds;

    @Value("${app.kafka.topic.otp-requested}")
    private String otpRequestedTopic;

    private String redisKey(UUID customerId) {
        return "otp:" + customerId;
    }

    @Override
    public Mono<GenerateOtpResponse> generateOtp(GenerateOtpRequest request) {
        String otp = generateNumericOtp();

        return redisTemplate.opsForValue()
                .set(redisKey(request.getCustomerId()), otp, Duration.ofSeconds(ttlSeconds))
                .flatMap(saved -> {
                    if (!Boolean.TRUE.equals(saved)) {
                        return Mono.just(new GenerateOtpResponse(false,
                                "Could not generate OTP, please try again", 0));
                    }
                    OtpRequestedPayload payload = new OtpRequestedPayload(
                            request.getCustomerId(), request.getMobileNumber(), otp, ttlSeconds);
                    return saveOutboxEvent(request.getCustomerId(), payload)
                            .thenReturn(new GenerateOtpResponse(true,
                                    "OTP sent to your registered mobile number", (int) ttlSeconds))
                            .onErrorResume(ex -> {
                                log.error("Failed to enqueue OTP notification for customer {}: {}",
                                        request.getCustomerId(), ex.getMessage());
                                return Mono.just(new GenerateOtpResponse(false,
                                        "Could not send OTP, please try again", 0));
                            });
                });
    }

    private Mono<OutboxEvent> saveOutboxEvent(UUID customerId, OtpRequestedPayload payload) {
        return Mono.fromCallable(() -> objectMapper.writeValueAsString(payload))
                .flatMap(json -> {
                    OutboxEvent event = new OutboxEvent();
                    event.setAggregateId(customerId);
                    event.setAggregateType("CUSTOMER");
                    event.setEventType("OtpRequested");
                    event.setTopic(otpRequestedTopic);
                    event.setPayload(json);
                    event.setCreatedAt(LocalDateTime.now());
                    return outboxEventRepository.save(event);
                });
    }

    @Override
    public Mono<VerifyOtpResponse> verifyOtp(VerifyOtpRequest request) {
        String key = redisKey(request.getCustomerId());
        return redisTemplate.opsForValue().get(key)
                .flatMap(storedOtp -> {
                    if (storedOtp.equals(request.getOtp())) {
                        return redisTemplate.delete(key)
                                .thenReturn(new VerifyOtpResponse(true, "OTP verified"));
                    }
                    return Mono.just(new VerifyOtpResponse(false, "Incorrect OTP"));
                })
                .switchIfEmpty(Mono.just(
                        new VerifyOtpResponse(false, "OTP expired or not found, please request a new one")));
    }

    private String generateNumericOtp() {
        StringBuilder sb = new StringBuilder(otpLength);
        for (int i = 0; i < otpLength; i++) {
            sb.append(RANDOM.nextInt(10));
        }
        return sb.toString();
    }
}