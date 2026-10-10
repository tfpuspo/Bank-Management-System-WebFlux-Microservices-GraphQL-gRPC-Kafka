package com.puspo.auth.service;

import com.puspo.auth.dto.auth.CreateStaffUserRequest;
import com.puspo.auth.dto.auth.FederatedUserNode;
import com.puspo.auth.dto.auth.LoginRequest;
import com.puspo.auth.dto.auth.LoginResponse;
import com.puspo.auth.dto.user.UserResponse;
import reactor.core.publisher.Mono;

public interface AuthService {
    Mono<LoginResponse> login(LoginRequest request);
    Mono<UserResponse> createStaffUser(CreateStaffUserRequest request);
    Mono<FederatedUserNode> me(java.util.UUID userId);
}