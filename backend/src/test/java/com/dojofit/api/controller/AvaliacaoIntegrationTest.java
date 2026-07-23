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
 * Fase 3d — avaliações do professor. Cobre o gating (só a equipe registra) e a
 * regra de visibilidade: o aluno só enxerga as avaliações públicas — a privada
 * não vaza para /eu/avaliacoes.
 */
@AutoConfigureMockMvc
@Transactional
class AvaliacaoIntegrationTest extends AbstractIntegrationTest {

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

    private void registrar(String conteudo, String tipo, boolean publico) throws Exception {
        String body = """
                {"tipo":"%s","conteudo":"%s","publico":%s}
                """.formatted(tipo, conteudo, publico);
        mockMvc.perform(post("/api/alunos/" + aluno.getId() + "/avaliacoes")
                        .header("Authorization", "Bearer " + professorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Aluno não pode registrar avaliação (registro da equipe)")
    void alunoNaoRegistra() throws Exception {
        mockMvc.perform(post("/api/alunos/" + aluno.getId() + "/avaliacoes")
                        .header("Authorization", "Bearer " + alunoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tipo\":\"OBSERVACAO\",\"conteudo\":\"x\",\"publico\":false}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Aluno vê só as públicas; a equipe vê todas")
    void visibilidadePorRegistro() throws Exception {
        registrar("Recomendo focar na defesa", "RECOMENDACAO", true);
        registrar("Anotacao interna sobre disciplina", "OBSERVACAO", false);

        // Equipe vê as duas
        mockMvc.perform(get("/api/alunos/" + aluno.getId() + "/avaliacoes")
                        .header("Authorization", "Bearer " + professorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        // Aluno vê só a pública
        mockMvc.perform(get("/api/eu/avaliacoes").header("Authorization", "Bearer " + alunoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].tipo").value("RECOMENDACAO"))
                .andExpect(jsonPath("$[0].publico").value(true));
    }
}
