package com.dojofit.api.controller;

import com.dojofit.api.AbstractIntegrationTest;
import com.dojofit.api.config.JwtUtil;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.model.enums.Role;
import com.dojofit.api.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Fluxo de onboarding por convite (docs/06 fluxo 2): papel definido pela
 * academia, token de uso único, cadastro sem convite bloqueado.
 */
@AutoConfigureMockMvc
class InviteRegistrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;
    private String emailConvidado;

    @BeforeEach
    void setUp() {
        var admin = new Usuario();
        admin.setNome("Admin Teste");
        admin.setEmail("admin-" + UUID.randomUUID().toString().substring(0, 8) + "@dojofit.com");
        admin.setRole(Role.ADMIN);
        usuarioRepository.save(admin);
        adminToken = jwtUtil.generateToken(admin);

        emailConvidado = "convidado-" + UUID.randomUUID().toString().substring(0, 8) + "@dojofit.com";
    }

    private String criarConvite(Role role) throws Exception {
        var result = mockMvc.perform(post("/api/convites")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\": \"%s\", \"role\": \"%s\"}".formatted(emailConvidado, role.name())))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    @Test
    @DisplayName("Cadastro via convite cria usuário com o papel definido pela academia")
    void registrationViaInviteAssignsRoleFromInvite() throws Exception {
        String token = criarConvite(Role.PROFESSOR);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\": \"Novo Professor\", \"senha\": \"senha-123\", \"conviteToken\": \"%s\"}"
                                .formatted(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value(emailConvidado))
                .andExpect(jsonPath("$.user.role").value("PROFESSOR"));

        var criado = usuarioRepository.findByEmail(emailConvidado).orElseThrow();
        assertEquals(Role.PROFESSOR, criado.getRole());
    }

    @Test
    @DisplayName("Convite é de uso único — segundo cadastro com o mesmo token falha")
    void inviteTokenIsSingleUse() throws Exception {
        String token = criarConvite(Role.ALUNO);
        String body = "{\"nome\": \"Aluno\", \"senha\": \"senha-123\", \"conviteToken\": \"%s\"}".formatted(token);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isUnprocessableEntity());

        assertEquals(1, usuarioRepository.findByEmail(emailConvidado).stream().count());
    }

    @Test
    @DisplayName("Cadastro com token inexistente é bloqueado (docs/06 caso de borda)")
    void registrationWithoutValidInviteIsBlocked() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\": \"Intruso\", \"senha\": \"senha-123\", \"conviteToken\": \"%s\"}"
                                .formatted(UUID.randomUUID())))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value(org.hamcrest.Matchers.containsString("requer convite")));
    }

    @Test
    @DisplayName("Cadastro sem token é rejeitado por validação")
    void registrationWithoutTokenFailsValidation() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\": \"Intruso\", \"senha\": \"senha-123\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Preview público do convite retorna e-mail e papel para a tela de cadastro")
    void invitePreviewReturnsEmailAndRole() throws Exception {
        String token = criarConvite(Role.ALUNO);

        mockMvc.perform(get("/api/auth/convites/" + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(emailConvidado))
                .andExpect(jsonPath("$.role").value("ALUNO"));
    }

    @Test
    @DisplayName("Aluno não pode criar convites (Gestão restrita)")
    void studentCannotCreateInvites() throws Exception {
        var aluno = new Usuario();
        aluno.setNome("Aluno");
        aluno.setEmail("aluno-" + UUID.randomUUID().toString().substring(0, 8) + "@dojofit.com");
        aluno.setRole(Role.ALUNO);
        usuarioRepository.save(aluno);

        mockMvc.perform(post("/api/convites")
                        .header("Authorization", "Bearer " + jwtUtil.generateToken(aluno))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\": \"x@dojofit.com\", \"role\": \"ALUNO\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Cadastro via convite já emite sessão completa (cookie de refresh)")
    void registrationIssuesRefreshCookie() throws Exception {
        String token = criarConvite(Role.ALUNO);

        var result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\": \"Aluno\", \"senha\": \"senha-123\", \"conviteToken\": \"%s\"}"
                                .formatted(token)))
                .andExpect(status().isOk())
                .andReturn();

        var cookie = result.getResponse().getCookie("dojofit_refresh");
        assertTrue(cookie != null && cookie.isHttpOnly());
    }
}
