package com.puspo.auth.service;

import reactor.core.publisher.Mono;

public interface UserIdService {
    Mono<String> generate();
}