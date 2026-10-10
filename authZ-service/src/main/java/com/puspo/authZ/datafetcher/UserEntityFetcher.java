package com.puspo.authZ.datafetcher;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsEntityFetcher;
import com.puspo.authZ.service.RoleAssignmentService;
import com.puspo.authZ.service.RolePermissionService;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@DgsComponent
@RequiredArgsConstructor
public class UserEntityFetcher {

    private final RoleAssignmentService roleAssignmentService;
    private final RolePermissionService rolePermissionService;

    @DgsEntityFetcher(name = "User")
    public Mono<Map<String, Object>> user(Map<String, Object> values) {
        String id = (String) values.get("id");
        String userType = (String) values.get("userType");
        String customerIdStr = (String) values.get("customerId");

        UUID subjectId = "CUSTOMER".equalsIgnoreCase(userType) && customerIdStr != null
                ? UUID.fromString(customerIdStr)
                : UUID.fromString(id);

        Mono<java.util.List<String>> rolesMono =
                roleAssignmentService.rolesForSubject(subjectId, userType).collectList();
        Mono<java.util.List<String>> permissionsMono =
                rolePermissionService.permissionsForSubject(subjectId, userType).collectList();

        return Mono.zip(rolesMono, permissionsMono)
                .map(tuple -> {
                    Map<String, Object> result = new HashMap<>(values);
                    result.put("__typename", "User");
                    result.put("roles", tuple.getT1());
                    result.put("permissions", tuple.getT2());
                    return result;
                });
    }
}