package com.puspo.account.dto.account;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OpenAccountResponse {
    private String customerId;
    private String accountId;
    private String accountNumber;
    private String roleCode;
}