package com.dojofit.api.controller;

import com.dojofit.api.AbstractIntegrationTest;
import com.dojofit.api.config.JwtUtil;
import com.dojofit.api.model.Modalidade;
import com.dojofit.api.model.Tecnica;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.model.enums.Role;
import com.dojofit.api.repository.ModalidadeRepository;
import com.dojofit.api.repository.TecnicaRepository;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Fase 3b — técnicas. Cobre o seed do catálogo, o gating do catálogo (só Admin
 * configura) e da avaliação (só equipe define; aluno lê a própria).
 */
@AutoConfigureMockMvc
@Transactional
class TecnicaIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private ModalidadeRepository modalidadeRepository;
    @Autowired
    private TecnicaRepository tecnicaRepository;

    private Usuario aluno;
    private String professorToken;
    private String alunoToken;
    private String adminToken;
    private Modalidade jiujitsu;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        professorToken = jwtUtil.generateToken(novoUsuario("prof-" + suffix, Role.PROFESSOR));
        aluno = novoUsuario("aluno-" + suffix, Role.ALUNO);
        alunoToken = jwtUtil.generateToken(aluno);
        adminToken = jwtUtil.generateToken(novoUsuario("admin-" + suffix, Role.ADMIN));

        jiujitsu = modalidadeRepository.findByAtivoTrueOrderByNomeAsc().stream()
                .filter(m -> m.getNome().equals("Jiu-Jitsu")).findFirst().orElseThrow();
    }

    private Usuario novoUsuario(String slug, Role role) {
        var u = new Usuario();
        u.setNome(slug);
        u.setEmail(slug + "@dojofit.com");
        u.setRole(role);
        return usuarioRepository.save(u);
    }

    private Long algumaTecnicaId() {
        return tecnicaRepository.findByModalidadeIdAndAtivoTrueOrderByNomeAsc(jiujitsu.getId()).get(0).getId();
    }

    @Test
    @DisplayName("Catálogo semeado de jiu-jitsu é exposto")
    void catalogoSemeado() throws Exception {
        mockMvc.perform(get("/api/modalidades/" + jiujitsu.getId() + "/tecnicas")
                        .header("Authorization", "Bearer " + alunoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(8));
    }

    @Test
    @DisplayName("Só o Admin configura o catálogo; Professor recebe 403")
    void catalogoRestritoAoAdmin() throws Exception {
        mockMvc.perform(post("/api/modalidades/" + jiujitsu.getId() + "/tecnicas")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Berimbolo\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Berimbolo"));

        mockMvc.perform(post("/api/modalidades/" + jiujitsu.getId() + "/tecnicas")
                        .header("Authorization", "Bearer " + professorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Omoplata\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Equipe define status; aluno não pode, mas lê a própria evolução")
    void avaliacaoRestritaAEquipe() throws Exception {
        Long tecnicaId = algumaTecnicaId();
        String url = "/api/alunos/" + aluno.getId() + "/tecnicas/" + tecnicaId;

        // Aluno não pode se autoavaliar
        mockMvc.perform(put(url)
                        .header("Authorization", "Bearer " + alunoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"DOMINADA\"}"))
                .andExpect(status().isForbidden());

        // Professor define o status
        mockMvc.perform(put(url)
                        .header("Authorization", "Bearer " + professorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"DOMINADA\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DOMINADA"));

        // Aluno lê a própria evolução
        mockMvc.perform(get("/api/eu/tecnicas").header("Authorization", "Bearer " + alunoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].status").value("DOMINADA"));
    }
}
