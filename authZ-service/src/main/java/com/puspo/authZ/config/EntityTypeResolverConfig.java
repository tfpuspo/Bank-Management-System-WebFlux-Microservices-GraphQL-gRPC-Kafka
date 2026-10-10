package com.puspo.authZ.config;

import com.netflix.graphql.dgs.federation.DefaultDgsFederationResolver;
import graphql.schema.GraphQLObjectType;
import graphql.schema.TypeResolver;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class EntityTypeResolverConfig extends DefaultDgsFederationResolver {

    @Override
    public TypeResolver typeResolver() {
        return environment -> {
            Object source = environment.getObject();
            if (source instanceof Map<?, ?> map) {
                Object typename = map.get("__typename");
                if (typename != null) {
                    return (GraphQLObjectType) environment.getSchema().getType(typename.toString());
                }
            }
            return null;
        };
    }
}