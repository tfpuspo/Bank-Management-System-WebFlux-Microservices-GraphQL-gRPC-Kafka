package com.puspo.auth.service;

import reactor.core.publisher.Mono;

public interface UserIdService {
    // Returns the next unique login user ID (plain number, no role prefix).
    Mono<String> generate();
}