package com.puspo.authZ.repository;

import com.puspo.authZ.entity.RolePermission;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface RolePermissionRepository extends ReactiveCrudRepository<RolePermission, UUID> {
    Flux<RolePermission> findByRoleId(UUID roleId);
    Mono<Boolean> existsByRoleIdAndPermissionId(UUID roleId, UUID permissionId);
}