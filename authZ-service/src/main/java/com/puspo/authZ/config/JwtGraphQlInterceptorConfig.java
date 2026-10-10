package com.puspo.authZ.config;

import com.puspo.authZ.security.JwtService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.server.WebGraphQlInterceptor;

@Configuration
public class JwtGraphQlInterceptorConfig {

    @Bean
    public WebGraphQlInterceptor jwtInterceptor(JwtService jwtService) {
        return (request, chain) -> {
            String authHeader = request.getHeaders().getFirst("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    var principal = jwtService.parseToken(authHeader.substring(7));
                    request.configureExecutionInput((executionInput, builder) ->
                            builder.graphQLContext(ctx -> ctx.put("principal", principal)).build());
                } catch (Exception ignored) {
                    // invalid/expired token: leave context empty; resolvers reject as unauthorized
                }
            }
            return chain.next(request);
        };
    }
}