package com.dojofit.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Constrói o cookie httpOnly do refresh token (docs/07 seção 7).
 * Path restrito a /api/auth: o cookie só trafega nos endpoints de autenticação.
 */
@Component
public class RefreshCookieFactory {

    public static final String COOKIE_NAME = "dojofit_refresh";
    public static final String COOKIE_PATH = "/api/auth";

    private final boolean secure;
    private final String sameSite;
    private final long refreshExpirationMs;

    public RefreshCookieFactory(
            @Value("${auth.cookie.secure}") boolean secure,
            @Value("${auth.cookie.same-site}") String sameSite,
            @Value("${jwt.refresh-expiration-ms}") long refreshExpirationMs) {
        this.secure = secure;
        this.sameSite = sameSite;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    public ResponseCookie create(String refreshToken) {
        return builder(refreshToken).maxAge(Duration.ofMillis(refreshExpirationMs)).build();
    }

    public ResponseCookie clear() {
        return builder("").maxAge(Duration.ZERO).build();
    }

    private ResponseCookie.ResponseCookieBuilder builder(String value) {
        return ResponseCookie.from(COOKIE_NAME, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path(COOKIE_PATH);
    }
}
