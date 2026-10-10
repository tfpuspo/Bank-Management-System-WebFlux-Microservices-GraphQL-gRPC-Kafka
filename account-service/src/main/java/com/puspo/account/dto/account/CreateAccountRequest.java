package com.puspo.account.dto.account;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateAccountRequest {
    private String accountNumber;
    private UUID customerId;
    private String accountType;      // "SAVINGS" | "CURRENT" | "FIXED_DEPOSIT"
    private BigDecimal initialDeposit;
}