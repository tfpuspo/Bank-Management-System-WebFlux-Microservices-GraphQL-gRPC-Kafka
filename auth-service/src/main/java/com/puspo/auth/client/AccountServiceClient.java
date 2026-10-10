package com.puspo.auth.client;

import com.puspo.account.grpc.AccountRequest;
import com.puspo.account.grpc.AccountResponse;
import com.puspo.account.grpc.AccountServiceGrpc;
import io.grpc.StatusRuntimeException;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Slf4j
@Component
public class AccountServiceClient {

    @GrpcClient("account")
    private AccountServiceGrpc.AccountServiceBlockingStub accountStub;

    public Mono<String> findCustomerIdByAccountNumber(String accountNumber) {
        return Mono.fromCallable(() -> {
                    AccountRequest request = AccountRequest.newBuilder()
                            .setAccountNumber(accountNumber)
                            .build();
                    return accountStub.getAccountByNumber(request);
                })
                .subscribeOn(Schedulers.boundedElastic())
                .flatMap(response -> response.getFound()
                        ? Mono.just(response.getCustomerId())
                        : Mono.<String>empty())
                .onErrorResume(StatusRuntimeException.class, ex -> {
                    log.error("gRPC call to Account Service failed for account {}: {}",
                            accountNumber, ex.getStatus());
                    return Mono.empty();
                });
    }
}