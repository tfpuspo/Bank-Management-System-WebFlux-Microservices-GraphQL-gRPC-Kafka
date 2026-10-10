package com.puspo.account.resolver;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import com.puspo.account.client.AuthZServiceClient;
import com.puspo.account.dto.account.AccountResponse;
import com.puspo.account.dto.account.CreateAccountRequest;
import com.puspo.account.security.AuthenticatedPrincipal;
import com.puspo.account.service.AccountService;
import graphql.schema.DataFetchingEnvironment;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import com.puspo.account.dto.account.OpenAccountRequest;
import com.puspo.account.dto.account.OpenAccountResponse;
import com.puspo.account.service.OpenAccountService;

@DgsComponent
@RequiredArgsConstructor
public class AccountResolver {

    private final AccountService accountService;
    private final AuthZServiceClient authZServiceClient;
    private final OpenAccountService openAccountService;

    @DgsQuery
    public Mono<AccountResponse> accountByNumber(@InputArgument("accountNumber") String accountNumber) {
        return accountService.getAccountByNumber(accountNumber);
    }

    @DgsQuery
    public Flux<AccountResponse> accounts(@InputArgument("accountNumber") String accountNumber,
                                          DataFetchingEnvironment dfe) {
        AuthenticatedPrincipal principal = dfe.getGraphQlContext().get("principal");
        if (principal == null) {
            return Flux.error(new RuntimeException("Not authenticated"));
        }
        return authZServiceClient.getPermissionsForSubject(principal.subjectId(), principal.subjectType())
                .flatMapMany(permissions -> {
                    boolean allowed = permissions.contains("ACCOUNT_VIEW") || permissions.contains("ACCOUNT_OPEN");
                    if (!allowed) {
                        return Flux.error(new RuntimeException(
                                "Forbidden: ACCOUNT_VIEW or ACCOUNT_OPEN permission required"));
                    }
                    return accountService.searchAccounts(accountNumber);
                });
    }

    @DgsMutation
    public Mono<AccountResponse> createAccount(@InputArgument("input") CreateAccountRequest input,
                                               DataFetchingEnvironment dfe) {
        AuthenticatedPrincipal principal = dfe.getGraphQlContext().get("principal");
        if (principal == null) {
            return Mono.error(new RuntimeException("Not authenticated"));
        }
        return authZServiceClient.hasPermission(principal.subjectId(), principal.subjectType(), "ACCOUNT_OPEN")
                .flatMap(allowed -> {
                    if (!Boolean.TRUE.equals(allowed)) {
                        return Mono.error(new RuntimeException("Forbidden: ACCOUNT_OPEN permission required"));
                    }
                    return accountService.createAccount(input);
                });
    }

    @DgsMutation
    public Mono<OpenAccountResponse> openAccount(@InputArgument("input") OpenAccountRequest input,
                                                 DataFetchingEnvironment dfe) {
        AuthenticatedPrincipal principal = dfe.getGraphQlContext().get("principal");
        String token = dfe.getGraphQlContext().get("token");
        if (principal == null || token == null) {
            return Mono.error(new RuntimeException("Not authenticated"));
        }
        return authZServiceClient.hasPermission(principal.subjectId(), principal.subjectType(), "ACCOUNT_OPEN")
                .flatMap(allowed -> {
                    if (!Boolean.TRUE.equals(allowed)) {
                        return Mono.error(new RuntimeException("Forbidden: ACCOUNT_OPEN permission required"));
                    }
                    return openAccountService.openAccount(token, input);
                });
    }
}