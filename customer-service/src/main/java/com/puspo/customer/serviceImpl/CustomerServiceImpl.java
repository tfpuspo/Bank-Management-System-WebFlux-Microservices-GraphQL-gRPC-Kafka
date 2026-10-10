package com.puspo.customer.serviceImpl;

import com.puspo.customer.dto.customer.CreateCustomerRequest;
import com.puspo.customer.dto.customer.CustomerResponse;
import com.puspo.customer.entity.Customer;
import com.puspo.customer.repository.CustomerRepository;
import com.puspo.customer.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private static final long ROLLBACK_WINDOW_MINUTES = 10;

    private final CustomerRepository customerRepository;

    @Override
    public Mono<CustomerResponse> createCustomer(CreateCustomerRequest request) {
        Customer customer = new Customer();
        customer.setFirstName(request.getFirstName());
        customer.setLastName(request.getLastName());
        customer.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
        customer.setMobileNumber(request.getMobileNumber());
        customer.setEmail(request.getEmail());
        customer.setNidNumber(request.getNidNumber());
        customer.setCreatedAt(LocalDateTime.now());

        return customerRepository.save(customer)
                .map(this::toResponse);
    }

    @Override
    public Mono<CustomerResponse> getCustomerById(UUID id) {
        return customerRepository.findById(id)
                .map(this::toResponse)
                .switchIfEmpty(Mono.error(new com.puspo.account.exception.ResourceNotFoundException("Customer not found: " + id)));
    }

    /** Compensation for a failed Open Account. Only recently created customers can be removed. */
    @Override
    public Mono<Boolean> rollbackCustomer(UUID id) {
        return customerRepository.findById(id)
                .flatMap(c -> {
                    if (c.getCreatedAt().isBefore(LocalDateTime.now().minusMinutes(ROLLBACK_WINDOW_MINUTES))) {
                        return Mono.<Boolean>error(new RuntimeException(
                                "Customer " + id + " is too old to roll back"));
                    }
                    return customerRepository.deleteById(id).thenReturn(true);
                })
                .defaultIfEmpty(true); // already gone = rolled back
    }

    private CustomerResponse toResponse(Customer customer) {
        CustomerResponse response = new CustomerResponse();
        response.setId(customer.getId().toString());
        response.setFirstName(customer.getFirstName());
        response.setLastName(customer.getLastName());
        response.setDateOfBirth(customer.getDateOfBirth().toString());
        response.setMobileNumber(customer.getMobileNumber());
        response.setEmail(customer.getEmail());
        response.setNidNumber(customer.getNidNumber());
        response.setCreatedAt(customer.getCreatedAt().toString());
        return response;
    }
}