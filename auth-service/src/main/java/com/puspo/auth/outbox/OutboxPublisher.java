package com.puspo.auth.outbox;

import com.puspo.auth.entity.OutboxEvent;
import com.puspo.auth.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxPublisher {

    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Scheduled(fixedDelayString = "${app.outbox.poll-interval-ms:2000}")
    public void publishPendingEvents() {
        outboxEventRepository.findTop50ByPublishedAtIsNullOrderByCreatedAtAsc()
                .flatMap(this::publish)
                .blockLast();
    }

    private Mono<Void> publish(OutboxEvent event) {
        return Mono.fromFuture(kafkaTemplate
                        .send(event.getTopic(), event.getAggregateId().toString(), event.getPayload())
                        .toCompletableFuture())
                .flatMap(result -> {
                    event.setPublishedAt(LocalDateTime.now());
                    return outboxEventRepository.save(event);
                })
                .doOnError(ex -> log.error("Failed to publish outbox event {}: {}",
                        event.getId(), ex.getMessage()))
                .onErrorResume(ex -> Mono.empty())
                .then();
    }
}