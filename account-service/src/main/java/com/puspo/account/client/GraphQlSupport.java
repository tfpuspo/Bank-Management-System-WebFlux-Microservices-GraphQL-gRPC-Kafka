package com.puspo.account.client;

import java.util.List;
import java.util.Map;

final class GraphQlSupport {

    private GraphQlSupport() {}

    @SuppressWarnings("unchecked")
    static Map<String, Object> dataOrThrow(Map<String, Object> response) {
        if (response == null) {
            throw new RuntimeException("Empty response from service");
        }
        Object errors = response.get("errors");
        if (errors instanceof List<?> list && !list.isEmpty()) {
            Object first = list.get(0);
            String message = first instanceof Map<?, ?> m && m.get("message") != null
                    ? String.valueOf(m.get("message")) : "Service call failed";
            throw new RuntimeException(message);
        }
        Object data = response.get("data");
        if (data == null) {
            throw new RuntimeException("Service returned no data");
        }
        return (Map<String, Object>) data;
    }
}