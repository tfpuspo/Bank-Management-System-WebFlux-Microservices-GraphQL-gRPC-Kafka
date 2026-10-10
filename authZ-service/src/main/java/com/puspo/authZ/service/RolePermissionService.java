package com.puspo.authZ.service;

import com.puspo.authZ.dto.permission.UserPermissionOverrideResponse;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface RolePermissionService {
    Mono<Boolean> assignPermissionToRole(String roleCode, String permissionCode, UUID grantedBy);
    Flux<String> permissionsForRole(String roleCode);
    Flux<String> permissionsForSubject(UUID subjectId, String subjectType);

    Mono<Boolean> setUserPermission(UUID subjectId, String subjectType, String permissionCode,
                                    String effect, UUID grantedBy);
    Mono<Boolean> removeUserPermission(UUID subjectId, String subjectType, String permissionCode);
    Flux<UserPermissionOverrideResponse> userPermissionOverrides(UUID subjectId, String subjectType);
}