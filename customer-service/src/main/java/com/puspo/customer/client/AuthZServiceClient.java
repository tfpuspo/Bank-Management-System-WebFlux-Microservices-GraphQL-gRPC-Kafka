package com.puspo.customer.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class AuthZServiceClient {

    private final WebClient webClient;

    public AuthZServiceClient(@Value("${app.authz.service-url}") String authZServiceUrl) {
        this.webClient = WebClient.builder().baseUrl(authZServiceUrl).build();
    }

    public Mono<Boolean> hasPermission(UUID subjectId, String subjectType, String permissionCode) {
        return getPermissionsForSubject(subjectId, subjectType)
                .map(permissions -> permissions.contains(permissionCode))
                .defaultIfEmpty(false);
    }

    @SuppressWarnings("unchecked")
    private Mono<List<String>> getPermissionsForSubject(UUID subjectId, String subjectType) {
        String query = """
                query PermissionsForSubject($subjectId: ID!, $subjectType: String!) {
                    permissionsForSubject(subjectId: $subjectId, subjectType: $subjectType)
                }
                """;

        Map<String, Object> body = Map.of(
                "query", query,
                "variables", Map.of("subjectId", subjectId.toString(), "subjectType", subjectType)
        );

        return webClient.post()
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    Map<String, Object> data = (Map<String, Object>) response.get("data");
                    if (data == null) {
                        return List.<String>of();
                    }
                    return (List<String>) data.get("permissionsForSubject");
                });
    }
}