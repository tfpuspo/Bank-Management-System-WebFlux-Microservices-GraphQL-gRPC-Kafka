package com.puspo.auth.resolver;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.InputArgument;
import com.puspo.auth.dto.registration.IdentityVerificationRequest;
import com.puspo.auth.dto.registration.IdentityVerificationResponse;
import com.puspo.auth.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@DgsComponent
@RequiredArgsConstructor
public class RegistrationResolver {

    private final RegistrationService registrationService;

    @DgsMutation
    public Mono<IdentityVerificationResponse> verifyIdentity(
            @InputArgument("input") IdentityVerificationRequest input) {
        return registrationService.verifyIdentity(input);
    }
}