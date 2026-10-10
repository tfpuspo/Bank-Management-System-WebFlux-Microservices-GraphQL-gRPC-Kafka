package com.puspo.authZ.serviceImpl;

import com.puspo.authZ.entity.Alkp;
import com.puspo.authZ.entity.RoleAssignment;
import com.puspo.authZ.repository.AlkpRepository;
import com.puspo.authZ.repository.RoleAssignmentRepository;
import com.puspo.authZ.service.RoleAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoleAssignmentServiceImpl implements RoleAssignmentService {

    private final AlkpRepository alkpRepository;
    private final RoleAssignmentRepository roleAssignmentRepository;

    @Override
    public Flux<String> rolesForSubject(UUID subjectId, String subjectType) {
        return alkpRepository.findByType("SUBJECT_TYPE")
                .filter(s -> s.getLabel().equalsIgnoreCase(subjectType))
                .next()
                .flatMapMany(subjectTypeAlkp ->
                        roleAssignmentRepository.findBySubjectIdAndSubjectTypeId(subjectId, subjectTypeAlkp.getId()))
                .flatMap(assignment -> alkpRepository.findById(assignment.getRoleId()))
                .map(Alkp::getLabel);
    }

    @Override
    public Mono<Boolean> assignRole(UUID subjectId, String subjectType, String roleCode,
                                    UUID assignedBy, boolean customerRolesOnly) {
        Mono<UUID> subjectTypeIdMono = alkpRepository.findByType("SUBJECT_TYPE")
                .filter(s -> s.getLabel().equalsIgnoreCase(subjectType))
                .next()
                .map(Alkp::getId)
                .switchIfEmpty(Mono.error(new RuntimeException("Unknown subjectType: " + subjectType)));

        Mono<Alkp> roleMono = alkpRepository.findByType("ROLE")
                .filter(r -> r.getLabel().equalsIgnoreCase(roleCode))
                .next()
                .switchIfEmpty(Mono.error(new RuntimeException("Unknown role: " + roleCode)));

        return Mono.zip(subjectTypeIdMono, roleMono)
                .flatMap(tuple -> {
                    UUID subjectTypeId = tuple.getT1();
                    Alkp role = tuple.getT2();

                    if (role.getParentId() != null && !role.getParentId().equals(subjectTypeId)) {
                        return Mono.error(new RuntimeException(
                                "Role " + roleCode + " is not applicable to subject type " + subjectType));
                    }
                    if (customerRolesOnly && role.getParentId() == null) {
                        return Mono.error(new RuntimeException(
                                "Role " + roleCode + " cannot be assigned here: it is not a "
                                        + subjectType.toLowerCase() + " role"));
                    }

                    // Assigning the same role twice is a no-op, not a duplicate row.
                    return roleAssignmentRepository
                            .findBySubjectIdAndSubjectTypeId(subjectId, subjectTypeId)
                            .any(existing -> existing.getRoleId().equals(role.getId()))
                            .flatMap(alreadyAssigned -> {
                                if (Boolean.TRUE.equals(alreadyAssigned)) {
                                    return Mono.just(true);
                                }
                                RoleAssignment assignment = new RoleAssignment();
                                assignment.setSubjectId(subjectId);
                                assignment.setSubjectTypeId(subjectTypeId);
                                assignment.setRoleId(role.getId());
                                assignment.setAssignedBy(assignedBy);
                                assignment.setAssignedAt(LocalDateTime.now());
                                return roleAssignmentRepository.save(assignment).thenReturn(true);
                            });
                });
    }
}