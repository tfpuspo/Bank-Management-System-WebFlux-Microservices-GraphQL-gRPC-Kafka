package com.puspo.customer.resolver;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import com.puspo.customer.client.AuthZServiceClient;
import com.puspo.customer.dto.customer.CreateCustomerRequest;
import com.puspo.customer.dto.customer.CustomerResponse;
import com.puspo.customer.security.AuthenticatedPrincipal;
import com.puspo.customer.service.CustomerService;
import graphql.schema.DataFetchingEnvironment;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

import java.util.UUID;

@DgsComponent
@RequiredArgsConstructor
public class CustomerResolver {

    private final CustomerService customerService;
    private final AuthZServiceClient authZServiceClient;

    @DgsQuery
    public Mono<CustomerResponse> customerById(@InputArgument("id") UUID id) {
        return customerService.getCustomerById(id);
    }

    @DgsMutation
    public Mono<CustomerResponse> createCustomer(@InputArgument("input") CreateCustomerRequest input,
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
                    return customerService.createCustomer(input);
                });
    }

    @DgsMutation
    public Mono<Boolean> rollbackCustomer(@InputArgument("id") UUID id, DataFetchingEnvironment dfe) {
        AuthenticatedPrincipal principal = dfe.getGraphQlContext().get("principal");
        if (principal == null) {
            return Mono.error(new RuntimeException("Not authenticated"));
        }
        return authZServiceClient.hasPermission(principal.subjectId(), principal.subjectType(), "ACCOUNT_OPEN")
                .flatMap(allowed -> {
                    if (!Boolean.TRUE.equals(allowed)) {
                        return Mono.error(new RuntimeException("Forbidden: ACCOUNT_OPEN permission required"));
                    }
                    return customerService.rollbackCustomer(id);
                });
    }
}