package com.puspo.account.client;

import com.puspo.account.dto.account.OpenAccountRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class CustomerServiceClient {

    private final WebClient webClient;

    public CustomerServiceClient(@Value("${app.customer.service-url}") String url) {
        this.webClient = WebClient.builder().baseUrl(url).build();
    }

    @SuppressWarnings("unchecked")
    public Mono<UUID> createCustomer(String token, OpenAccountRequest r) {
        String query = """
                mutation CreateCustomer($input: CreateCustomerInput!) {
                    createCustomer(input: $input) { id }
                }
                """;
        Map<String, Object> input = new HashMap<>();
        input.put("firstName", r.getFirstName());
        input.put("lastName", r.getLastName());
        input.put("dateOfBirth", r.getDateOfBirth());
        input.put("mobileNumber", r.getMobileNumber());
        input.put("email", r.getEmail());
        input.put("nidNumber", r.getNidNumber());

        return post(token, query, Map.of("input", input))
                .map(data -> {
                    Map<String, Object> c = (Map<String, Object>) data.get("createCustomer");
                    return UUID.fromString(String.valueOf(c.get("id")));
                });
    }

    public Mono<Void> rollbackCustomer(String token, UUID customerId) {
        String query = """
                mutation RollbackCustomer($id: ID!) {
                    rollbackCustomer(id: $id)
                }
                """;
        return post(token, query, Map.of("id", customerId.toString())).then();
    }

    @SuppressWarnings("unchecked")
    private Mono<Map<String, Object>> post(String token, String query, Map<String, Object> variables) {
        return webClient.post()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .bodyValue(Map.of("query", query, "variables", variables))
                .retrieve()
                .bodyToMono(Map.class)
                .map(resp -> GraphQlSupport.dataOrThrow((Map<String, Object>) resp));
    }
}