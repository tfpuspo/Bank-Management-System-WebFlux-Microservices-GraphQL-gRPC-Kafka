package com.puspo.customer.grpc;

import com.puspo.customer.entity.Customer;
import com.puspo.customer.repository.CustomerRepository;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

import java.time.LocalDate;
import java.util.UUID;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class CustomerGrpcService extends CustomerServiceGrpc.CustomerServiceImplBase {

    private final CustomerRepository customerRepository;

    @Override
    public void matchIdentity(IdentityMatchRequest request, StreamObserver<IdentityMatchResponse> responseObserver) {
        UUID customerId;
        try {
            customerId = UUID.fromString(request.getCustomerId());
        } catch (IllegalArgumentException ex) {
            log.warn("Invalid customerId received: {}", request.getCustomerId());
            respondNoMatch(responseObserver);
            return;
        }

        customerRepository.findById(customerId)
                .map(customer -> matches(customer, request.getDateOfBirth(), request.getMobileNumber()))
                .defaultIfEmpty(false)
                .subscribe(
                        matched -> {
                            responseObserver.onNext(
                                    IdentityMatchResponse.newBuilder().setMatched(matched).build());
                            responseObserver.onCompleted();
                        },
                        error -> {
                            log.error("matchIdentity failed for customerId {}: {}",
                                    customerId, error.getMessage());
                            responseObserver.onError(error);
                        }
                );
    }

    private boolean matches(Customer customer, String dateOfBirth, String mobileNumber) {
        boolean dobMatches = LocalDate.parse(dateOfBirth).equals(customer.getDateOfBirth());
        boolean mobileMatches = mobileNumber.equals(customer.getMobileNumber());
        return dobMatches && mobileMatches;
    }

    private void respondNoMatch(StreamObserver<IdentityMatchResponse> responseObserver) {
        responseObserver.onNext(IdentityMatchResponse.newBuilder().setMatched(false).build());
        responseObserver.onCompleted();
    }
}