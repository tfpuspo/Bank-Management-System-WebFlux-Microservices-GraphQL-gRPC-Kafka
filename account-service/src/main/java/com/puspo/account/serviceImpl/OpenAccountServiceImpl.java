package com.puspo.account.serviceImpl;

import com.puspo.account.client.AuthZServiceClient;
import com.puspo.account.client.CustomerServiceClient;
import com.puspo.account.dto.account.AccountResponse;
import com.puspo.account.dto.account.CreateAccountRequest;
import com.puspo.account.dto.account.OpenAccountRequest;
import com.puspo.account.dto.account.OpenAccountResponse;
import com.puspo.account.entity.Account;
import com.puspo.account.repository.AccountRepository;
import com.puspo.account.service.AccountService;
import com.puspo.account.service.OpenAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class OpenAccountServiceImpl implements OpenAccountService {

    private final CustomerServiceClient customerClient;
    private final AuthZServiceClient authZClient;
    private final AccountService accountService;
    private final AccountRepository accountRepository;

    @Override
    public Mono<OpenAccountResponse> openAccount(String token, OpenAccountRequest r) {
        
        try {
            Account.AccountType.valueOf(r.getAccountType());
        } catch (Exception e) {
            return Mono.error(new RuntimeException("Invalid account type: " + r.getAccountType()));
        }

       
        return customerClient.createCustomer(token, r).flatMap(customerId -> {

            CreateAccountRequest acct = new CreateAccountRequest();
            acct.setAccountNumber(generateAccountNumber());
            acct.setCustomerId(customerId);
            acct.setAccountType(r.getAccountType());
            acct.setInitialDeposit(r.getInitialDeposit());

            
            return accountService.createAccount(acct)
                    .onErrorResume(ex -> compensate(token, customerId, null, ex))
                    .flatMap(account -> {
                        UUID accountId = UUID.fromString(account.getId());

                        
                        Mono<Void> roleStep = isBlank(r.getRoleCode())
                                ? Mono.empty()
                                : authZClient.assignRole(token, customerId, "CUSTOMER", r.getRoleCode())
                                .flatMap(ok -> Boolean.TRUE.equals(ok)
                                        ? Mono.<Void>empty()
                                        : Mono.<Void>error(new RuntimeException("Role assignment was not applied")))
                                .onErrorResume(ex -> compensate(token, customerId, accountId, ex));

                        return roleStep.then(Mono.fromSupplier(() -> toResponse(customerId, account, r.getRoleCode())));
                    });
        });
    }

    
    private <T> Mono<T> compensate(String token, UUID customerId, UUID accountId, Throwable cause) {
        Mono<Void> deleteAccount = accountId == null
                ? Mono.empty()
                : accountRepository.deleteById(accountId);

        return deleteAccount
                .then(customerClient.rollbackCustomer(token, customerId))
                .then(Mono.<T>error(cause))
                .onErrorResume(ex -> {
                    if (ex == cause) {
                        return Mono.error(cause);
                    }
                    return Mono.error(new RuntimeException(cause.getMessage()
                            + " (automatic cleanup also failed - customer " + customerId
                            + " needs manual cleanup)"));
                });
    }

    private OpenAccountResponse toResponse(UUID customerId, AccountResponse account, String roleCode) {
        OpenAccountResponse res = new OpenAccountResponse();
        res.setCustomerId(customerId.toString());
        res.setAccountId(account.getId());
        res.setAccountNumber(account.getAccountNumber());
        res.setRoleCode(isBlank(roleCode) ? null : roleCode);
        return res;
    }

    private String generateAccountNumber() {
        long n = ThreadLocalRandom.current().nextLong(1_000_000_000L, 10_000_000_000L);
        return "AC" + n;
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}