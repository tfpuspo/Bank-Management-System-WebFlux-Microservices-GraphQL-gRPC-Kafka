package com.puspo.auth.serviceImpl;

import com.puspo.auth.service.UserIdService;
import lombok.RequiredArgsConstructor;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class UserIdServiceImpl implements UserIdService {

    private static final String USER_ID_PREFIX = "UI";

    private final DatabaseClient databaseClient;

    
    @Override
    public Mono<String> generate() {
        return databaseClient.sql("SELECT nextval('auth.user_id_seq')")
                .map((row, metadata) -> row.get(0, Long.class))
                .one()
                .map(n -> USER_ID_PREFIX + n);
    }
}