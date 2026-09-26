package com.puspo.auth.service;

import com.puspo.auth.dto.otp.GenerateOtpRequest;
import com.puspo.auth.dto.otp.GenerateOtpResponse;
import com.puspo.auth.dto.otp.VerifyOtpRequest;
import com.puspo.auth.dto.otp.VerifyOtpResponse;
import reactor.core.publisher.Mono;

public interface OtpService {
    Mono<GenerateOtpResponse> generateOtp(GenerateOtpRequest request);
    Mono<VerifyOtpResponse> verifyOtp(VerifyOtpRequest request);
}