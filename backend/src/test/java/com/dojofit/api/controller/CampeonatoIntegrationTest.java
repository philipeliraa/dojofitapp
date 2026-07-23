package com.dojofit.api.controller;

import com.dojofit.api.AbstractIntegrationTest;
import com.dojofit.api.config.JwtUtil;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.model.enums.Role;
import com.dojofit.api.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Fase 3c — campeonatos. Cobre o gating de papel (só a equipe registra) e a
 * leitura da própria linha do tempo pelo aluno.
 */
@AutoConfigureMockMvc
@Transactional
class CampeonatoIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UsuarioRepository usuarioRepository;

    private Usuario aluno;
    private String professorToken;
    private String alunoToken;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        professorToken = jwtUtil.generateToken(novoUsuario("prof-" + suffix, Role.PROFESSOR));
        aluno = novoUsuario("aluno-" + suffix, Role.ALUNO);
        alunoToken = jwtUtil.generateToken(aluno);
    }

    private Usuario novoUsuario(String slug, Role role) {
        var u = new Usuario();
        u.setNome(slug);
        u.setEmail(slug + "@dojofit.com");
        u.setRole(role);
        u.setAcademia(academiaPadrao());
        return usuarioRepository.save(u);
    }

    private String corpo() {
        return """
                {"nome":"Copa SP","data":"2026-05-10","resultado":"OURO","categoria":"Adulto Azul Medio"}
                """;
    }

    @Test
    @DisplayName("Aluno não pode registrar campeonato (registro da equipe)")
    void alunoNaoRegistra() throws Exception {
        mockMvc.perform(post("/api/alunos/" + aluno.getId() + "/campeonatos")
                        .header("Authorization", "Bearer " + alunoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo()))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Professor registra e o aluno vê na própria linha do tempo")
    void professorRegistraAlunoVe() throws Exception {
        mockMvc.perform(post("/api/alunos/" + aluno.getId() + "/campeonatos")
                        .header("Authorization", "Bearer " + professorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resultado").value("OURO"))
                .andExpect(jsonPath("$.nome").value("Copa SP"));

        mockMvc.perform(get("/api/eu/campeonatos").header("Authorization", "Bearer " + alunoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].resultado").value("OURO"));
    }
}
