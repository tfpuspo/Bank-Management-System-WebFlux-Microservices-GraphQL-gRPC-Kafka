package com.puspo.auth.dto.otp;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class GenerateOtpResponse {
    private boolean success;
    private String message;
    private int expiresInSeconds;
}