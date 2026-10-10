package com.puspo.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Component
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-seconds:3600}")
    private long expirationSeconds;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(UUID userId, UUID subjectId, String subjectType, List<String> roles) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationSeconds * 1000);
        return Jwts.builder()
                .subject(userId.toString())
                .claim("subjectId", subjectId != null ? subjectId.toString() : null)
                .claim("subjectType", subjectType)
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key())
                .compact();
    }

    @SuppressWarnings("unchecked")
    public AuthenticatedPrincipal parseToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        UUID userId = UUID.fromString(claims.getSubject());
        String subjectIdStr = claims.get("subjectId", String.class);
        UUID subjectId = subjectIdStr != null ? UUID.fromString(subjectIdStr) : null;
        String subjectType = claims.get("subjectType", String.class);
        List<String> roles = claims.get("roles", List.class);

        return new AuthenticatedPrincipal(userId, subjectId, subjectType, roles);
    }

    public long getExpirationSeconds() {
        return expirationSeconds;
    }
}