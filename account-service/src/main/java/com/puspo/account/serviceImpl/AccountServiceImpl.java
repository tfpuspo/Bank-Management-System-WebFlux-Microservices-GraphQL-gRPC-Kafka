package com.puspo.account.serviceImpl;

import com.puspo.account.dto.account.AccountResponse;
import com.puspo.account.dto.account.CreateAccountRequest;
import com.puspo.account.entity.Account;
import com.puspo.account.exception.ResourceNotFoundException;
import com.puspo.account.repository.AccountRepository;
import com.puspo.account.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;

    @Override
    public Mono<AccountResponse> createAccount(CreateAccountRequest request) {
        Account account = new Account();
        account.setAccountNumber(request.getAccountNumber());
        account.setCustomerId(request.getCustomerId());
        account.setAccountType(Account.AccountType.valueOf(request.getAccountType()));
        account.setBalance(request.getInitialDeposit() != null ? request.getInitialDeposit() : BigDecimal.ZERO);
        account.setStatus(Account.AccountStatus.ACTIVE);
        account.setCreatedAt(LocalDateTime.now());

        return accountRepository.save(account)
                .map(this::toResponse)
                .onErrorMap(DataIntegrityViolationException.class,
                        ex -> new RuntimeException("Account number already exists: " + request.getAccountNumber()));
    }

    @Override
    public Mono<AccountResponse> getAccountByNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .map(this::toResponse)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException(
                        "Account not found: " + accountNumber)));
    }

    @Override
    public Flux<AccountResponse> searchAccounts(String accountNumber) {
        String query = accountNumber == null ? "" : accountNumber.trim();
        Flux<Account> accounts = query.isEmpty()
                ? accountRepository.findAllByOrderByCreatedAtDesc()
                : accountRepository.findByAccountNumberContainingIgnoreCaseOrderByCreatedAtDesc(query);
        return accounts.map(this::toResponse);
    }

    private AccountResponse toResponse(Account account) {
        AccountResponse response = new AccountResponse();
        response.setId(account.getId().toString());
        response.setAccountNumber(account.getAccountNumber());
        response.setCustomerId(account.getCustomerId().toString());
        response.setAccountType(account.getAccountType().name());
        response.setBalance(account.getBalance());
        response.setStatus(account.getStatus().name());
        response.setCreatedAt(account.getCreatedAt().toString());
        return response;
    }
}