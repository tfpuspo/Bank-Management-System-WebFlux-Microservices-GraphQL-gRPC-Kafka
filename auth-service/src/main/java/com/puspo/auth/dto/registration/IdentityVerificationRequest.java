package com.puspo.auth.dto.registration;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IdentityVerificationRequest {
    private String accountNumber;
    private String dateOfBirth;
    private String mobileNumber;
}
