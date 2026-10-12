package com.puspo.authZ.resolver;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import com.puspo.authZ.security.AuthenticatedPrincipal;
import com.puspo.authZ.service.RoleAssignmentService;
import com.puspo.authZ.service.RolePermissionService;
import graphql.schema.DataFetchingEnvironment;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@DgsComponent
@RequiredArgsConstructor
public class RoleAssignmentResolver {

    private static final String CUSTOMER_ROLE_ASSIGN = "CUSTOMER_ROLE_ASSIGN";

    private final RoleAssignmentService roleAssignmentService;
    private final RolePermissionService rolePermissionService;

    @DgsQuery
    public Flux<String> rolesForSubject(@InputArgument("subjectId") UUID subjectId,
                                        @InputArgument("subjectType") String subjectType) {
        return roleAssignmentService.rolesForSubject(subjectId, subjectType);
    }

    
    @DgsMutation
    public Mono<Boolean> assignRole(@InputArgument("subjectId") UUID subjectId,
                                    @InputArgument("subjectType") String subjectType,
                                    @InputArgument("roleCode") String roleCode,
                                    DataFetchingEnvironment dfe) {
        AuthenticatedPrincipal principal = dfe.getGraphQlContext().get("principal");
        if (principal == null) {
            return Mono.error(new RuntimeException("Not authenticated"));
        }

        if (principal.hasRole("SUPER_ADMIN")) {
            return roleAssignmentService.assignRole(subjectId, subjectType, roleCode, principal.userId(), false);
        }

        if (!"CUSTOMER".equalsIgnoreCase(subjectType)) {
            return Mono.error(new RuntimeException("Forbidden: SUPER_ADMIN role required"));
        }

        return rolePermissionService.permissionsForSubject(principal.subjectId(), principal.subjectType())
                .collectList()
                .flatMap(permissions -> {
                    if (!permissions.contains(CUSTOMER_ROLE_ASSIGN)) {
                        return Mono.error(new RuntimeException(
                                "Forbidden: " + CUSTOMER_ROLE_ASSIGN + " permission required"));
                    }
                    return roleAssignmentService.assignRole(
                            subjectId, subjectType, roleCode, principal.userId(), true);
                });
    }
}