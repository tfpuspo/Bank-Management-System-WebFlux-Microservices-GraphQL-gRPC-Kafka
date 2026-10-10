package com.puspo.authZ.serviceImpl;

import com.puspo.authZ.dto.permission.UserPermissionOverrideResponse;
import com.puspo.authZ.entity.Alkp;
import com.puspo.authZ.entity.RolePermission;
import com.puspo.authZ.entity.UserPermission;
import com.puspo.authZ.repository.AlkpRepository;
import com.puspo.authZ.repository.RolePermissionRepository;
import com.puspo.authZ.repository.UserPermissionRepository;
import com.puspo.authZ.service.RoleAssignmentService;
import com.puspo.authZ.service.RolePermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RolePermissionServiceImpl implements RolePermissionService {

    private static final String GRANT = "GRANT";
    private static final String DENY = "DENY";

    private final AlkpRepository alkpRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final UserPermissionRepository userPermissionRepository;
    private final RoleAssignmentService roleAssignmentService;

    @Override
    public Mono<Boolean> assignPermissionToRole(String roleCode, String permissionCode, UUID grantedBy) {
        Mono<Alkp> roleMono = alkpRepository.findByType("ROLE")
                .filter(r -> r.getLabel().equalsIgnoreCase(roleCode))
                .next()
                .switchIfEmpty(Mono.error(new RuntimeException("Unknown role: " + roleCode)));

        Mono<Alkp> permissionMono = findPermission(permissionCode);

        return Mono.zip(roleMono, permissionMono)
                .flatMap(tuple -> {
                    UUID roleId = tuple.getT1().getId();
                    UUID permissionId = tuple.getT2().getId();

                    return rolePermissionRepository.existsByRoleIdAndPermissionId(roleId, permissionId)
                            .flatMap(alreadyGranted -> {
                                if (Boolean.TRUE.equals(alreadyGranted)) {
                                    return Mono.just(true);
                                }
                                RolePermission rp = new RolePermission();
                                rp.setRoleId(roleId);
                                rp.setPermissionId(permissionId);
                                rp.setGrantedBy(grantedBy);
                                rp.setGrantedAt(LocalDateTime.now());
                                return rolePermissionRepository.save(rp).thenReturn(true);
                            });
                });
    }

    @Override
    public Flux<String> permissionsForRole(String roleCode) {
        return alkpRepository.findByType("ROLE")
                .filter(r -> r.getLabel().equalsIgnoreCase(roleCode))
                .next()
                .switchIfEmpty(Mono.error(new RuntimeException("Unknown role: " + roleCode)))
                .flatMapMany(role -> rolePermissionRepository.findByRoleId(role.getId()))
                .flatMap(rp -> alkpRepository.findById(rp.getPermissionId()))
                .map(Alkp::getLabel);
    }

    // Effective permissions = (permissions of all the subject's roles
    //                          + the subject's GRANT overrides)
    //                          - the subject's DENY overrides.
    @Override
    public Flux<String> permissionsForSubject(UUID subjectId, String subjectType) {
        Mono<Set<String>> fromRoles = roleAssignmentService.rolesForSubject(subjectId, subjectType)
                .flatMap(this::permissionsForRole)
                .collect(LinkedHashSet::new, Set::add);

        return Mono.zip(fromRoles, overridesFor(subjectId, subjectType).collectList())
                .flatMapMany(tuple -> {
                    Set<String> result = new LinkedHashSet<>(tuple.getT1());
                    for (UserPermissionOverrideResponse o : tuple.getT2()) {
                        if (GRANT.equals(o.getEffect())) {
                            result.add(o.getPermission());
                        } else if (DENY.equals(o.getEffect())) {
                            result.remove(o.getPermission());
                        }
                    }
                    return Flux.fromIterable(result);
                });
    }

    @Override
    public Mono<Boolean> setUserPermission(UUID subjectId, String subjectType, String permissionCode,
                                           String effect, UUID grantedBy) {
        String normalized = effect == null ? "" : effect.trim().toUpperCase();
        if (!GRANT.equals(normalized) && !DENY.equals(normalized)) {
            return Mono.error(new RuntimeException("Effect must be GRANT or DENY"));
        }

        Mono<UUID> subjectTypeIdMono = subjectTypeId(subjectType)
                .switchIfEmpty(Mono.error(new RuntimeException("Unknown subjectType: " + subjectType)));

        return Mono.zip(subjectTypeIdMono, findPermission(permissionCode))
                .flatMap(tuple -> {
                    UUID typeId = tuple.getT1();
                    UUID permissionId = tuple.getT2().getId();

                    return userPermissionRepository
                            .findBySubjectIdAndSubjectTypeIdAndPermissionId(subjectId, typeId, permissionId)
                            .defaultIfEmpty(new UserPermission())
                            .flatMap(row -> {
                                row.setSubjectId(subjectId);
                                row.setSubjectTypeId(typeId);
                                row.setPermissionId(permissionId);
                                row.setEffect(normalized);
                                row.setGrantedBy(grantedBy);
                                row.setGrantedAt(LocalDateTime.now());
                                return userPermissionRepository.save(row);
                            })
                            .thenReturn(true);
                });
    }

    @Override
    public Mono<Boolean> removeUserPermission(UUID subjectId, String subjectType, String permissionCode) {
        Mono<UUID> subjectTypeIdMono = subjectTypeId(subjectType)
                .switchIfEmpty(Mono.error(new RuntimeException("Unknown subjectType: " + subjectType)));

        return Mono.zip(subjectTypeIdMono, findPermission(permissionCode))
                .flatMap(tuple -> userPermissionRepository
                        .findBySubjectIdAndSubjectTypeIdAndPermissionId(
                                subjectId, tuple.getT1(), tuple.getT2().getId())
                        .flatMap(userPermissionRepository::delete)
                        .thenReturn(true));
    }

    @Override
    public Flux<UserPermissionOverrideResponse> userPermissionOverrides(UUID subjectId, String subjectType) {
        return overridesFor(subjectId, subjectType);
    }

    private Flux<UserPermissionOverrideResponse> overridesFor(UUID subjectId, String subjectType) {
        return subjectTypeId(subjectType)
                .flatMapMany(typeId -> userPermissionRepository.findBySubjectIdAndSubjectTypeId(subjectId, typeId))
                .flatMap(row -> alkpRepository.findById(row.getPermissionId())
                        .map(p -> new UserPermissionOverrideResponse(p.getLabel(), row.getEffect())));
    }

    private Mono<UUID> subjectTypeId(String subjectType) {
        return alkpRepository.findByType("SUBJECT_TYPE")
                .filter(s -> s.getLabel().equalsIgnoreCase(subjectType))
                .next()
                .map(Alkp::getId);
    }

    private Mono<Alkp> findPermission(String permissionCode) {
        return alkpRepository.findByType("PERMISSION")
                .filter(p -> p.getLabel().equalsIgnoreCase(permissionCode))
                .next()
                .switchIfEmpty(Mono.error(new RuntimeException("Unknown permission: " + permissionCode)));
    }
}