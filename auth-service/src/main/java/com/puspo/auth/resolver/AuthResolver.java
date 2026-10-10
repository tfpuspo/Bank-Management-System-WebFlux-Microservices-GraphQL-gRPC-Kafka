package com.puspo.auth.resolver;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import com.puspo.auth.dto.auth.CreateStaffUserRequest;
import com.puspo.auth.dto.auth.FederatedUserNode;
import com.puspo.auth.dto.auth.LoginRequest;
import com.puspo.auth.dto.auth.LoginResponse;
import com.puspo.auth.dto.user.UserResponse;
import com.puspo.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@DgsComponent
@RequiredArgsConstructor
public class AuthResolver {

    private final AuthService authService;

    @DgsMutation
    public Mono<LoginResponse> login(@InputArgument("input") LoginRequest input) {
        return authService.login(input);
    }

    @DgsMutation
    public Mono<UserResponse> createStaffUser(@InputArgument("input") CreateStaffUserRequest input) {
        return authService.createStaffUser(input);
    }

    @DgsQuery
    public Mono<FederatedUserNode> me(graphql.schema.DataFetchingEnvironment dfe) {
        com.puspo.auth.security.AuthenticatedPrincipal principal = dfe.getGraphQlContext().get("principal");
        if (principal == null) {
            return Mono.error(new RuntimeException("Not authenticated"));
        }
        return authService.me(principal.userId());
    }
}