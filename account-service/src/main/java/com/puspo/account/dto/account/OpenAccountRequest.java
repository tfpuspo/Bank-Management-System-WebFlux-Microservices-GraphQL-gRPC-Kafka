package com.puspo.account.dto.account;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class OpenAccountRequest {
    private String firstName;
    private String lastName;
    private String dateOfBirth;
    private String mobileNumber;
    private String email;
    private String nidNumber;
    private String accountType;
    private BigDecimal initialDeposit;
    private String roleCode;
}