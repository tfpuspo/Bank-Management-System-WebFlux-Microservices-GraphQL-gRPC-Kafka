package com.puspo.auth.resolver;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.InputArgument;
import com.puspo.auth.dto.otp.GenerateOtpRequest;
import com.puspo.auth.dto.otp.GenerateOtpResponse;
import com.puspo.auth.dto.otp.VerifyOtpRequest;
import com.puspo.auth.dto.otp.VerifyOtpResponse;
import com.puspo.auth.service.OtpService;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@DgsComponent
@RequiredArgsConstructor
public class OtpResolver {

    private final OtpService otpService;

    @DgsMutation
    public Mono<GenerateOtpResponse> generateOtp(@InputArgument("input") GenerateOtpRequest input) {
        return otpService.generateOtp(input);
    }

    @DgsMutation
    public Mono<VerifyOtpResponse> verifyOtp(@InputArgument("input") VerifyOtpRequest input) {
        return otpService.verifyOtp(input);
    }
}