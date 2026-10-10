package com.puspo.auth.serviceImpl;

import com.puspo.auth.service.UserIdService;
import lombok.RequiredArgsConstructor;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class UserIdServiceImpl implements UserIdService {

    // Same prefix for every user (not tied to any role). Change here if you want another.
    private static final String USER_ID_PREFIX = "UI";

    private final DatabaseClient databaseClient;

    // A database sequence is atomic, so two users created at the same instant can
    // never receive the same ID. Result looks like "UI10000001".
    @Override
    public Mono<String> generate() {
        return databaseClient.sql("SELECT nextval('auth.user_id_seq')")
                .map((row, metadata) -> row.get(0, Long.class))
                .one()
                .map(n -> USER_ID_PREFIX + n);
    }
}