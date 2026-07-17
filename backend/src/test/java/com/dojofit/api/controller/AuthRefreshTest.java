package com.dojofit.api.controller;

import com.dojofit.api.AbstractIntegrationTest;
import com.dojofit.api.config.JwtUtil;
import com.dojofit.api.config.RefreshCookieFactory;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.model.enums.Role;
import com.dojofit.api.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Valida a arquitetura de sessão de docs/07 seção 7: access token em memória
 * (corpo da resposta) + refresh token em cookie httpOnly, com tipos distintos.
 */
@AutoConfigureMockMvc
class AuthRefreshTest extends AbstractIntegrationTest {

    private static final String SENHA = "senha-forte-123";

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private ObjectMapper objectMapper;

    private Usuario aluno;

    @BeforeEach
    void setUp() {
        aluno = new Usuario();
        aluno.setNome("Aluno Sessao");
        aluno.setEmail("sessao-" + UUID.randomUUID().toString().substring(0, 8) + "@dojofit.com");
        aluno.setSenhaHash(passwordEncoder.encode(SENHA));
        aluno.setRole(Role.ALUNO);
        usuarioRepository.save(aluno);
    }

    private MvcResult login() throws Exception {
        return mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\": \"%s\", \"senha\": \"%s\"}".formatted(aluno.getEmail(), SENHA)))
                .andExpect(status().isOk())
                .andReturn();
    }

    @Test
    @DisplayName("Login emite refresh token em cookie httpOnly restrito a /api/auth")
    void loginSetsHttpOnlyRefreshCookie() throws Exception {
        var result = login();

        var refreshCookie = result.getResponse().getCookie(RefreshCookieFactory.COOKIE_NAME);
        assertNotNull(refreshCookie);
        assertTrue(refreshCookie.isHttpOnly());
        assertEquals(RefreshCookieFactory.COOKIE_PATH, refreshCookie.getPath());
        assertEquals(JwtUtil.TYPE_REFRESH, jwtUtil.extractTokenType(refreshCookie.getValue()));

        String accessToken = objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
        assertEquals(JwtUtil.TYPE_ACCESS, jwtUtil.extractTokenType(accessToken));
    }

    @Test
    @DisplayName("Refresh com cookie válido renova access token e rotaciona o cookie")
    void refreshRenewsSessionAndRotatesCookie() throws Exception {
        var loginCookie = login().getResponse().getCookie(RefreshCookieFactory.COOKIE_NAME);

        var result = mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new Cookie(RefreshCookieFactory.COOKIE_NAME, loginCookie.getValue())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value(aluno.getEmail()))
                .andExpect(cookie().httpOnly(RefreshCookieFactory.COOKIE_NAME, true))
                .andReturn();

        // O access token renovado autentica chamadas protegidas
        String accessToken = objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
        mockMvc.perform(get("/api/checkins/historico")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Refresh sem cookie retorna 401")
    void refreshWithoutCookieIsUnauthorized() throws Exception {
        mockMvc.perform(post("/api/auth/refresh"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Access token não vale como refresh token (claim type)")
    void accessTokenCannotBeUsedAsRefreshToken() throws Exception {
        String accessToken = jwtUtil.generateToken(aluno);

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new Cookie(RefreshCookieFactory.COOKIE_NAME, accessToken)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Refresh token não vale como access token em endpoint protegido")
    void refreshTokenCannotAuthenticateProtectedEndpoint() throws Exception {
        String refreshToken = jwtUtil.generateRefreshToken(aluno);

        mockMvc.perform(get("/api/checkins/historico")
                        .header("Authorization", "Bearer " + refreshToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Usuário inativo não renova sessão")
    void inactiveUserCannotRefresh() throws Exception {
        var loginCookie = login().getResponse().getCookie(RefreshCookieFactory.COOKIE_NAME);
        aluno.setAtivo(false);
        usuarioRepository.save(aluno);

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new Cookie(RefreshCookieFactory.COOKIE_NAME, loginCookie.getValue())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Logout expira o cookie de refresh (Max-Age=0)")
    void logoutClearsRefreshCookie() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isNoContent())
                .andExpect(cookie().maxAge(RefreshCookieFactory.COOKIE_NAME, 0));
    }
}
