package com.puspo.auth.serviceImpl;

import com.puspo.auth.client.AccountServiceClient;
import com.puspo.auth.client.CustomerServiceClient;
import com.puspo.auth.dto.registration.IdentityVerificationRequest;
import com.puspo.auth.dto.registration.IdentityVerificationResponse;
import com.puspo.auth.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {

    private final AccountServiceClient accountServiceClient;
    private final CustomerServiceClient customerServiceClient;

    @Override
    public Mono<IdentityVerificationResponse> verifyIdentity(IdentityVerificationRequest request) {
        return accountServiceClient.findCustomerIdByAccountNumber(request.getAccountNumber())
                .flatMap(customerId ->
                        customerServiceClient.matchesIdentity(
                                        customerId, request.getDateOfBirth(), request.getMobileNumber())
                                .map(matched -> matched
                                        ? new IdentityVerificationResponse(true, customerId, "Identity verified")
                                        : new IdentityVerificationResponse(false, null,
                                        "Date of birth or mobile number doesn't match our records"))
                )
                .switchIfEmpty(Mono.just(
                        new IdentityVerificationResponse(false, null, "Account number not found")))
                .onErrorReturn(
                        new IdentityVerificationResponse(false, null,
                                "Verification service is unavailable, please try again shortly"));
    }
}