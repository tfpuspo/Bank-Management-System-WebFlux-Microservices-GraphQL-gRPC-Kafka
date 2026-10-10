package com.puspo.authZ.service;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface RoleAssignmentService {
    Flux<String> rolesForSubject(UUID subjectId, String subjectType);

    // customerRolesOnly = true: the role must be explicitly scoped to the subject type
    // (its parent is that subject type). Used for non-SUPER_ADMIN callers so they cannot
    // hand out roles that are unrestricted or meant for another subject type.
    Mono<Boolean> assignRole(UUID subjectId, String subjectType, String roleCode,
                             UUID assignedBy, boolean customerRolesOnly);
}