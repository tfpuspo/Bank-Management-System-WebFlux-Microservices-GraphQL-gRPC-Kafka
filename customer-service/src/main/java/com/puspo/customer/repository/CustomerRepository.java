package com.puspo.customer.repository;

import com.puspo.customer.entity.Customer;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import java.util.UUID;

public interface CustomerRepository extends ReactiveCrudRepository<Customer, UUID> {
}