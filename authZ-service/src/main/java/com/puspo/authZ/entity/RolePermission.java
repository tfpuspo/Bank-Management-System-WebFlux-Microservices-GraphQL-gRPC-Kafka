package com.puspo.authZ.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Table(schema = "authz", value = "role_permission")
public class RolePermission {

    @Id
    private UUID id;

    private UUID roleId;
    private UUID permissionId;
    private UUID grantedBy;
    private LocalDateTime grantedAt;
}