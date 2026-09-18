package com.puspo.auth.client;

import com.puspo.customer.grpc.CustomerServiceGrpc;
import com.puspo.customer.grpc.IdentityMatchRequest;
import com.puspo.customer.grpc.IdentityMatchResponse;
import io.grpc.StatusRuntimeException;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Slf4j
@Component
public class CustomerServiceClient {

    @GrpcClient("customer")
    private CustomerServiceGrpc.CustomerServiceBlockingStub customerStub;

    public Mono<Boolean> matchesIdentity(String customerId, String dateOfBirth, String mobileNumber) {
        return Mono.fromCallable(() -> {
                    IdentityMatchRequest request = IdentityMatchRequest.newBuilder()
                            .setCustomerId(customerId)
                            .setDateOfBirth(dateOfBirth)
                            .setMobileNumber(mobileNumber)
                            .build();
                    return customerStub.matchIdentity(request);
                })
                .subscribeOn(Schedulers.boundedElastic())
                .map(IdentityMatchResponse::getMatched)
                .onErrorResume(StatusRuntimeException.class, ex -> {
                    log.error("gRPC call to Customer Service failed for customerId {}: {}",
                            customerId, ex.getStatus());
                    return Mono.just(false);
                });
    }
}