package com.puspo.auth.resolver;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import com.puspo.auth.dto.registration.RegisterRequest;
import com.puspo.auth.dto.user.UserRequest;
import com.puspo.auth.dto.user.UserResponse;
import com.puspo.auth.service.UserService;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.util.UUID;

@DgsComponent
@RequiredArgsConstructor
public class UserResolver {

    private final UserService userService;

    @DgsQuery
    public Mono<UserResponse> user(@InputArgument String id) {
        return userService.getUserById(UUID.fromString(id));
    }

    @DgsQuery
    public Mono<UserResponse> userByUsername(@InputArgument String username) {
        return userService.getUserByUsername(username);
    }

    @DgsQuery
    public Flux<UserResponse> allUsers() {
        return userService.getAllUsers();
    }

    @DgsMutation
    public Mono<UserResponse> createUser(@InputArgument UserRequest input) {
        return userService.createUser(input);
    }

    @DgsMutation
    public Mono<UserResponse> register(@InputArgument("input") RegisterRequest input) {
        return userService.register(input);
    }
}