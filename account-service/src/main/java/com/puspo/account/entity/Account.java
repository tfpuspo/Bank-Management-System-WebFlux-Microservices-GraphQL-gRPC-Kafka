package com.puspo.account.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Table("accounts")
public class Account {

    @Id
    private UUID id;

    private String accountNumber;
    private UUID customerId;
    private AccountType accountType;
    private BigDecimal balance;
    private AccountStatus status;
    private LocalDateTime createdAt;

    public enum AccountType {
        SAVINGS,
        CURRENT,
        FIXED_DEPOSIT
    }

    public enum AccountStatus {
        ACTIVE,
        PENDING,
        CLOSED
    }
}