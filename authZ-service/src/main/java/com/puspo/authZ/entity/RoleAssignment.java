package com.puspo.authZ.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Table(schema = "authz", value = "role_assignment")
public class RoleAssignment {

    @Id
    private UUID id;

    private UUID subjectId;
    private UUID subjectTypeId;
    private UUID roleId;
    private UUID assignedBy;
    private LocalDateTime assignedAt;
}