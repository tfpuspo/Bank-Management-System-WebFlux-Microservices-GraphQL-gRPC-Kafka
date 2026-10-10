package com.puspo.account.dto.account;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class AccountResponse {
    private String id;
    private String accountNumber;
    private String customerId;
    private String accountType;
    private BigDecimal balance;
    private String status;
    private String createdAt;
}