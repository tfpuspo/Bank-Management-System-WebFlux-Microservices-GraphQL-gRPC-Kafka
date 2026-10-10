package com.puspo.auth.repository;

import com.puspo.auth.entity.OutboxEvent;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

import java.util.UUID;

public interface OutboxEventRepository extends ReactiveCrudRepository<OutboxEvent, UUID> {
    Flux<OutboxEvent> findTop50ByPublishedAtIsNullOrderByCreatedAtAsc();
}