package com.puspo.authZ.resolver;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import com.puspo.authZ.dto.permission.UserPermissionOverrideResponse;
import com.puspo.authZ.security.AuthenticatedPrincipal;
import com.puspo.authZ.service.RolePermissionService;
import graphql.schema.DataFetchingEnvironment;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@DgsComponent
@RequiredArgsConstructor
public class RolePermissionResolver {

    private final RolePermissionService rolePermissionService;

    @DgsMutation
    public Mono<Boolean> assignPermissionToRole(@InputArgument("roleCode") String roleCode,
                                                @InputArgument("permissionCode") String permissionCode,
                                                DataFetchingEnvironment dfe) {
        AuthenticatedPrincipal principal = dfe.getGraphQlContext().get("principal");
        if (principal == null || !principal.hasRole("SUPER_ADMIN")) {
            return Mono.error(new RuntimeException("Forbidden: SUPER_ADMIN role required"));
        }
        return rolePermissionService.assignPermissionToRole(roleCode, permissionCode, principal.userId());
    }

    @DgsQuery
    public Flux<String> permissionsForRole(@InputArgument("roleCode") String roleCode) {
        return rolePermissionService.permissionsForRole(roleCode);
    }

    @DgsQuery
    public Flux<String> permissionsForSubject(@InputArgument("subjectId") UUID subjectId,
                                              @InputArgument("subjectType") String subjectType) {
        return rolePermissionService.permissionsForSubject(subjectId, subjectType);
    }

    @DgsMutation
    public Mono<Boolean> setUserPermission(@InputArgument("subjectId") UUID subjectId,
                                           @InputArgument("subjectType") String subjectType,
                                           @InputArgument("permissionCode") String permissionCode,
                                           @InputArgument("effect") String effect,
                                           DataFetchingEnvironment dfe) {
        AuthenticatedPrincipal principal = dfe.getGraphQlContext().get("principal");
        if (principal == null || !principal.hasRole("SUPER_ADMIN")) {
            return Mono.error(new RuntimeException("Forbidden: SUPER_ADMIN role required"));
        }
        return rolePermissionService.setUserPermission(
                subjectId, subjectType, permissionCode, effect, principal.userId());
    }

    @DgsMutation
    public Mono<Boolean> removeUserPermission(@InputArgument("subjectId") UUID subjectId,
                                              @InputArgument("subjectType") String subjectType,
                                              @InputArgument("permissionCode") String permissionCode,
                                              DataFetchingEnvironment dfe) {
        AuthenticatedPrincipal principal = dfe.getGraphQlContext().get("principal");
        if (principal == null || !principal.hasRole("SUPER_ADMIN")) {
            return Mono.error(new RuntimeException("Forbidden: SUPER_ADMIN role required"));
        }
        return rolePermissionService.removeUserPermission(subjectId, subjectType, permissionCode);
    }

    @DgsQuery
    public Flux<UserPermissionOverrideResponse> userPermissionOverrides(
            @InputArgument("subjectId") UUID subjectId,
            @InputArgument("subjectType") String subjectType,
            DataFetchingEnvironment dfe) {
        AuthenticatedPrincipal principal = dfe.getGraphQlContext().get("principal");
        if (principal == null || !principal.hasRole("SUPER_ADMIN")) {
            return Flux.error(new RuntimeException("Forbidden: SUPER_ADMIN role required"));
        }
        return rolePermissionService.userPermissionOverrides(subjectId, subjectType);
    }
}