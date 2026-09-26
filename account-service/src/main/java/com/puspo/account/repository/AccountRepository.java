package com.puspo.account.repository;

import com.puspo.account.entity.Account;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;
import java.util.UUID;

public interface AccountRepository extends ReactiveCrudRepository<Account, UUID> {
    Mono<Account> findByAccountNumber(String accountNumber);
}