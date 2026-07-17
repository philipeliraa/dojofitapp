package com.dojofit.api.controller;

import com.dojofit.api.config.RefreshCookieFactory;
import com.dojofit.api.dto.request.GoogleAuthRequest;
import com.dojofit.api.dto.request.LoginRequest;
import com.dojofit.api.dto.request.RegisterRequest;
import com.dojofit.api.dto.response.AuthResponse;
import com.dojofit.api.dto.response.ConvitePreviewResponse;
import com.dojofit.api.service.AuthService;
import com.dojofit.api.service.AuthSession;
import com.dojofit.api.service.ConviteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final ConviteService conviteService;
    private final RefreshCookieFactory refreshCookieFactory;

    /** Consulta pública do convite para a tela de cadastro preencher e-mail (docs/06 fluxo 2). */
    @GetMapping("/convites/{token}")
    public ResponseEntity<ConvitePreviewResponse> previewConvite(@PathVariable UUID token) {
        return ResponseEntity.ok(ConvitePreviewResponse.from(conviteService.validar(token)));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return respondWith(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return respondWith(authService.login(request));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(@Valid @RequestBody GoogleAuthRequest request) {
        return respondWith(authService.loginWithGoogle(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(name = RefreshCookieFactory.COOKIE_NAME, required = false) String refreshToken) {
        return respondWith(authService.refresh(refreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, refreshCookieFactory.clear().toString())
                .build();
    }

    // Access token vai no corpo (memória do frontend); refresh token vai em
    // cookie httpOnly — nunca acessível a JavaScript (docs/07 seção 7)
    private ResponseEntity<AuthResponse> respondWith(AuthSession session) {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookieFactory.create(session.refreshToken()).toString())
                .body(new AuthResponse(session.accessToken(), session.user()));
    }
}
