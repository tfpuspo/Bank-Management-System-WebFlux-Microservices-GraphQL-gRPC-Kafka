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
    private UUID customerId;
    private String username;
    private String email;
    private String password;
    private UserType userType;
    private LocalDateTime createdAt;

    // The login credential, e.g. "10000001". Generated automatically (no role prefix)
    // the moment the user is created — staff creation or customer registration.
    // See UserIdServiceImpl#generate.
    private String userId;

    public enum UserType {
        CUSTOMER,
        STAFF
    }
}