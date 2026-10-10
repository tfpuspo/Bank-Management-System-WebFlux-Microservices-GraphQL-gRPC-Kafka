package com.puspo.authZ.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Table(schema = "authz", value = "user_permission")
public class UserPermission {

    @Id
    private UUID id;

    private UUID subjectId;
    private UUID subjectTypeId;
    private UUID permissionId;

    // "GRANT" = extra permission on top of the user's roles
    // "DENY"  = removes a permission the user's roles would otherwise give
    private String effect;

    private UUID grantedBy;
    private LocalDateTime grantedAt;
}