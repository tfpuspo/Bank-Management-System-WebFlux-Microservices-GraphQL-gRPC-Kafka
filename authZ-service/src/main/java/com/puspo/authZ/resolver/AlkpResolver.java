package com.puspo.authZ.resolver;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import com.puspo.authZ.dto.alkp.AlkpRequest;
import com.puspo.authZ.dto.alkp.AlkpResponse;
import com.puspo.authZ.security.AuthenticatedPrincipal;
import com.puspo.authZ.service.AlkpService;
import graphql.schema.DataFetchingEnvironment;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@DgsComponent
@RequiredArgsConstructor
public class AlkpResolver {

    private final AlkpService alkpService;

    @DgsQuery
    public Flux<AlkpResponse> allAlkps() {
        return alkpService.findAll();
    }

    @DgsQuery
    public Flux<AlkpResponse> alkpsByType(@InputArgument("type") String type) {
        return alkpService.findByType(type);
    }

    @DgsQuery
    public Flux<AlkpResponse> searchAlkp(@InputArgument("type") String type,
                                         @InputArgument("label") String label) {
        return alkpService.search(type, label);
    }

    @DgsMutation
    public Mono<AlkpResponse> createAlkp(@InputArgument("input") AlkpRequest input, DataFetchingEnvironment dfe) {
        AuthenticatedPrincipal principal = dfe.getGraphQlContext().get("principal");
        if (principal == null || !principal.hasRole("SUPER_ADMIN")) {
            return Mono.error(new RuntimeException("Forbidden: SUPER_ADMIN role required"));
        }
        return alkpService.create(input);
    }

    @DgsMutation
    public Mono<Boolean> deleteAlkp(@InputArgument("id") UUID id, DataFetchingEnvironment dfe) {
        AuthenticatedPrincipal principal = dfe.getGraphQlContext().get("principal");
        if (principal == null || !principal.hasRole("SUPER_ADMIN")) {
            return Mono.error(new RuntimeException("Forbidden: SUPER_ADMIN role required"));
        }
        return alkpService.delete(id).thenReturn(true);
    }
}