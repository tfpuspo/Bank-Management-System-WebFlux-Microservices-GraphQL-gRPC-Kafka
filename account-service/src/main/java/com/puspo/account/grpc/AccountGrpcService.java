package com.puspo.account.grpc;

import com.puspo.account.repository.AccountRepository;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class AccountGrpcService extends AccountServiceGrpc.AccountServiceImplBase {

    private final AccountRepository accountRepository;

    @Override
    public void getAccountByNumber(AccountRequest request, StreamObserver<AccountResponse> responseObserver) {
        accountRepository.findByAccountNumber(request.getAccountNumber())
                .map(account -> AccountResponse.newBuilder()
                        .setFound(true)
                        .setCustomerId(account.getCustomerId().toString())
                        .setStatus(account.getStatus().name())
                        .build())
                .defaultIfEmpty(AccountResponse.newBuilder().setFound(false).build())
                .subscribe(
                        response -> {
                            responseObserver.onNext(response);
                            responseObserver.onCompleted();
                        },
                        error -> {
                            log.error("getAccountByNumber failed for {}: {}",
                                    request.getAccountNumber(), error.getMessage());
                            responseObserver.onError(error);
                        }
                );
    }
}