package com.puspo.authZ.repository;

import com.puspo.authZ.entity.RoleAssignment;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

import java.util.UUID;

public interface RoleAssignmentRepository extends ReactiveCrudRepository<RoleAssignment, UUID> {
    Flux<RoleAssignment> findBySubjectIdAndSubjectTypeId(UUID subjectId, UUID subjectTypeId);
}