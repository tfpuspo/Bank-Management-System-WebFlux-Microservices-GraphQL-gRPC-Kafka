package com.puspo.auth.service;

import com.puspo.auth.dto.registration.RegisterRequest;
import com.puspo.auth.dto.user.UserRequest;
import com.puspo.auth.dto.user.UserResponse;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.util.UUID;

public interface UserService {
    Mono<UserResponse> createUser(UserRequest request);
    Mono<UserResponse> register(RegisterRequest request);
    Mono<UserResponse> getUserById(UUID id);
    Mono<UserResponse> getUserByUsername(String username);
    Flux<UserResponse> getAllUsers();
}