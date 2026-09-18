package com.puspo.auth.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

@Table("users")
@Getter
@Setter
public class User {

    @Id
    private UUID id;
    private String username;
    private String email;
    private String password;
    private LocalDateTime createdAt;
}