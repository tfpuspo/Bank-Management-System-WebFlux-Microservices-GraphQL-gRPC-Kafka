package com.puspo.authZ.repository;

import com.puspo.authZ.entity.UserPermission;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface UserPermissionRepository extends ReactiveCrudRepository<UserPermission, UUID> {
    Flux<UserPermission> findBySubjectIdAndSubjectTypeId(UUID subjectId, UUID subjectTypeId);
    Mono<UserPermission> findBySubjectIdAndSubjectTypeIdAndPermissionId(
            UUID subjectId, UUID subjectTypeId, UUID permissionId);
}