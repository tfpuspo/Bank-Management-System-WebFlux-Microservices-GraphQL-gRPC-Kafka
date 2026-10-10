package com.puspo.authZ.repository;

import com.puspo.authZ.entity.Alkp;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

import java.util.UUID;

public interface AlkpRepository extends ReactiveCrudRepository<Alkp, UUID> {
    Flux<Alkp> findByType(String type);
    Flux<Alkp> findByTypeAndLabelContainingIgnoreCase(String type, String label);
    Flux<Alkp> findByLabelContainingIgnoreCase(String label);
    Flux<Alkp> findByParentId(UUID parentId);
}