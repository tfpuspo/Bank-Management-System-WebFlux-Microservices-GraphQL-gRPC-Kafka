package com.puspo.auth.dto.otp;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class GenerateOtpRequest {
    private UUID customerId;
    private String mobileNumber;
}