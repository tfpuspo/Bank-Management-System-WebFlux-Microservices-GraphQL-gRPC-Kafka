package com.puspo.auth.service;

import com.puspo.auth.dto.registration.IdentityVerificationRequest;
import com.puspo.auth.dto.registration.IdentityVerificationResponse;
import reactor.core.publisher.Mono;

public interface RegistrationService {
    Mono<IdentityVerificationResponse> verifyIdentity(IdentityVerificationRequest request);
}