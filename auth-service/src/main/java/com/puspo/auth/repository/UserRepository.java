package com.puspo.auth.repository;

import com.puspo.auth.entity.User;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;
import java.util.UUID;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends ReactiveCrudRepository<User, UUID> {
    Mono<User> findByUsername(String username);
    Mono<User> findByEmail(String email);
    Mono<Boolean> existsByUsername(String username);
    Mono<Boolean> existsByEmail(String email);
    @Query("SELECT EXISTS (SELECT 1 FROM auth.users WHERE customer_id = CAST(:customerId AS varchar))")
    Mono<Boolean> existsByCustomerId(@Param("customerId") UUID customerId);

    Mono<User> findByUserId(String userId);
    Mono<User> findByCustomerId(UUID customerId);
}