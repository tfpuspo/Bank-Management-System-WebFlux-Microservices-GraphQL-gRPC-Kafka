package com.puspo.account.service;

import com.puspo.account.dto.account.OpenAccountRequest;
import com.puspo.account.dto.account.OpenAccountResponse;
import reactor.core.publisher.Mono;

public interface OpenAccountService {
    Mono<OpenAccountResponse> openAccount(String token, OpenAccountRequest request);
}