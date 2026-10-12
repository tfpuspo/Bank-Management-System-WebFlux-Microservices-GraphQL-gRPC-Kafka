package com.puspo.account.service;

import com.puspo.account.dto.account.AccountResponse;
import com.puspo.account.dto.account.CreateAccountRequest;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface AccountService {
    Mono<AccountResponse> createAccount(CreateAccountRequest request);
    Mono<AccountResponse> getAccountByNumber(String accountNumber);
    Flux<AccountResponse> searchAccounts(String accountNumber);
}