package com.dojofit.api.controller;

import com.dojofit.api.AbstractIntegrationTest;
import com.dojofit.api.config.JwtUtil;
import com.dojofit.api.model.Aviso;
import com.dojofit.api.model.FeedbackAviso;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.model.enums.Role;
import com.dojofit.api.repository.AvisoRepository;
import com.dojofit.api.repository.FeedbackAvisoRepository;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Fase 2 — Mural (docs/02 §4). Cobre o não-negociável de papel (publicação só
 * de Professor/Admin) e a decisão de produto desta fase: feedback é privado
 * (aluno vê só os próprios; a academia vê todos) + moderação básica.
 */
@AutoConfigureMockMvc
@Transactional // rollback por método: os asserts usam count()/length() e exigem isolamento
class MuralIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private AvisoRepository avisoRepository;
    @Autowired
    private FeedbackAvisoRepository feedbackAvisoRepository;

    private Usuario professor;
    private Usuario aluno;
    private Usuario outroAluno;
    private String professorToken;
    private String alunoToken;
    private String outroAlunoToken;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);

        professor = novoUsuario("professor-" + suffix, Role.PROFESSOR);
        aluno = novoUsuario("aluno-" + suffix, Role.ALUNO);
        outroAluno = novoUsuario("outro-" + suffix, Role.ALUNO);

        professorToken = jwtUtil.generateToken(professor);
        alunoToken = jwtUtil.generateToken(aluno);
        outroAlunoToken = jwtUtil.generateToken(outroAluno);
    }

    private Usuario novoUsuario(String slug, Role role) {
        var u = new Usuario();
        u.setNome(slug);
        u.setEmail(slug + "@dojofit.com");
        u.setRole(role);
        return usuarioRepository.save(u);
    }

    private Aviso novoAviso() {
        var aviso = new Aviso();
        aviso.setTitulo("Treino especial");
        aviso.setConteudo("Sabado as 10h");
        aviso.setAutor(professor);
        return avisoRepository.save(aviso);
    }

    private FeedbackAviso novoFeedback(Aviso aviso, Usuario autor) {
        var f = new FeedbackAviso();
        f.setAviso(aviso);
        f.setAutor(autor);
        f.setConteudo("Vou estar la!");
        return feedbackAvisoRepository.save(f);
    }

    @Test
    @DisplayName("Aluno não pode publicar aviso (papel atribuído pela academia)")
    void alunoNaoPublicaAviso() throws Exception {
        mockMvc.perform(post("/api/avisos")
                        .header("Authorization", "Bearer " + alunoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titulo\":\"X\",\"conteudo\":\"Y\"}"))
                .andExpect(status().isForbidden());

        assertEquals(0, avisoRepository.count());
    }

    @Test
    @DisplayName("Professor publica aviso e ele aparece no feed")
    void professorPublicaAviso() throws Exception {
        mockMvc.perform(post("/api/avisos")
                        .header("Authorization", "Bearer " + professorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titulo\":\"Treino especial\",\"conteudo\":\"Sabado as 10h\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.autorNome").value(professor.getNome()));

        mockMvc.perform(get("/api/avisos").header("Authorization", "Bearer " + alunoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].titulo").value("Treino especial"));
    }

    @Test
    @DisplayName("Feedback é privado: aluno só vê o próprio; a academia vê todos")
    void feedbackEhPrivado() throws Exception {
        var aviso = novoAviso();
        novoFeedback(aviso, aluno);
        novoFeedback(aviso, outroAluno);

        // Aluno vê só o próprio feedback
        mockMvc.perform(get("/api/avisos").header("Authorization", "Bearer " + alunoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].feedbacks.length()").value(1))
                .andExpect(jsonPath("$[0].feedbacks[0].autorId").value(aluno.getId()));

        // Professor (academia) vê todos
        mockMvc.perform(get("/api/avisos").header("Authorization", "Bearer " + professorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].feedbacks.length()").value(2));
    }

    @Test
    @DisplayName("Aluno adiciona feedback ao aviso")
    void alunoAdicionaFeedback() throws Exception {
        var aviso = novoAviso();

        mockMvc.perform(post("/api/avisos/" + aviso.getId() + "/feedbacks")
                        .header("Authorization", "Bearer " + alunoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"conteudo\":\"Posso levar visitante?\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.autorId").value(aluno.getId()));

        assertEquals(1, feedbackAvisoRepository.findByAvisoIdOrderByCriadoEmAsc(aviso.getId()).size());
    }

    @Test
    @DisplayName("Outro aluno não pode remover feedback alheio (moderação)")
    void outroAlunoNaoRemoveFeedbackAlheio() throws Exception {
        var aviso = novoAviso();
        var feedback = novoFeedback(aviso, aluno);

        mockMvc.perform(delete("/api/avisos/" + aviso.getId() + "/feedbacks/" + feedback.getId())
                        .header("Authorization", "Bearer " + outroAlunoToken))
                .andExpect(status().isForbidden());

        assertEquals(1, feedbackAvisoRepository.count());
    }

    @Test
    @DisplayName("Professor remove aviso e seus feedbacks em cascata")
    void professorRemoveAvisoEmCascata() throws Exception {
        var aviso = novoAviso();
        novoFeedback(aviso, aluno);

        mockMvc.perform(delete("/api/avisos/" + aviso.getId())
                        .header("Authorization", "Bearer " + professorToken))
                .andExpect(status().isOk());

        assertEquals(0, avisoRepository.count());
        assertEquals(0, feedbackAvisoRepository.count());
    }
}
