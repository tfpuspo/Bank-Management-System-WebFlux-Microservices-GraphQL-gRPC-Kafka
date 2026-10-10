package com.puspo.customer.service;

import com.puspo.customer.dto.customer.CreateCustomerRequest;
import com.puspo.customer.dto.customer.CustomerResponse;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface CustomerService {
    Mono<CustomerResponse> createCustomer(CreateCustomerRequest request);
    Mono<CustomerResponse> getCustomerById(UUID id);
    Mono<Boolean> rollbackCustomer(UUID id);
}