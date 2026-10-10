package com.puspo.authZ.service;

import com.puspo.authZ.dto.alkp.AlkpRequest;
import com.puspo.authZ.dto.alkp.AlkpResponse;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface AlkpService {
    Mono<AlkpResponse> create(AlkpRequest request);
    Flux<AlkpResponse> findAll();
    Flux<AlkpResponse> findByType(String type);
    Flux<AlkpResponse> search(String type, String label);
    Mono<Void> delete(UUID id);
}