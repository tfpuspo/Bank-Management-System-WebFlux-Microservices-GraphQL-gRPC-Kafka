package com.puspo.auth.dto.registration;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IdentityVerificationResponse {
    private boolean verified;
    private String customerId;
    private String message;
}
