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
    private String effect;
    private UUID grantedBy;
    private LocalDateTime grantedAt;
}