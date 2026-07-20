package com.dojofit.api.controller;

import com.dojofit.api.AbstractIntegrationTest;
import com.dojofit.api.config.JwtUtil;
import com.dojofit.api.model.Faixa;
import com.dojofit.api.model.Modalidade;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.model.enums.Role;
import com.dojofit.api.repository.FaixaRepository;
import com.dojofit.api.repository.ModalidadeRepository;
import com.dojofit.api.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Fase 3a — progressão (docs/06 fluxo 3). Cobre o seed da modalidade jiu-jitsu,
 * o gating de papel (só equipe concede) e a faixa atual refletindo a graduação.
 */
@AutoConfigureMockMvc
@Transactional
class ProgressaoIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private ModalidadeRepository modalidadeRepository;
    @Autowired
    private FaixaRepository faixaRepository;

    private Usuario professor;
    private Usuario aluno;
    private String professorToken;
    private String alunoToken;
    private String adminToken;
    private Modalidade jiujitsu;
    private List<Faixa> faixas;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        professor = novoUsuario("professor-" + suffix, Role.PROFESSOR);
        aluno = novoUsuario("aluno-" + suffix, Role.ALUNO);
        professorToken = jwtUtil.generateToken(professor);
        alunoToken = jwtUtil.generateToken(aluno);
        adminToken = jwtUtil.generateToken(novoUsuario("admin-" + suffix, Role.ADMIN));

        // Modalidade e faixas vêm do seed da migração V13
        jiujitsu = modalidadeRepository.findByAtivoTrueOrderByNomeAsc().stream()
                .filter(m -> m.getNome().equals("Jiu-Jitsu")).findFirst().orElseThrow();
        faixas = faixaRepository.findByModalidadeIdOrderByOrdemAsc(jiujitsu.getId());
    }

    private Usuario novoUsuario(String slug, Role role) {
        var u = new Usuario();
        u.setNome(slug);
        u.setEmail(slug + "@dojofit.com");
        u.setRole(role);
        return usuarioRepository.save(u);
    }

    private String corpoGraduacao(Faixa faixa, int grau) {
        return """
                {"alunoId": %d, "modalidadeId": %d, "faixaId": %d, "grau": %d, "data": "2026-07-19"}
                """.formatted(aluno.getId(), jiujitsu.getId(), faixa.getId(), grau);
    }

    @Test
    @DisplayName("Seed do jiu-jitsu expõe as 5 faixas ordenadas")
    void seedExpoeFaixas() throws Exception {
        mockMvc.perform(get("/api/modalidades/" + jiujitsu.getId() + "/faixas")
                        .header("Authorization", "Bearer " + alunoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(5))
                .andExpect(jsonPath("$[0].nome").value("Branca"))
                .andExpect(jsonPath("$[4].nome").value("Preta"))
                .andExpect(jsonPath("$[4].grausMax").value(6));
    }

    @Test
    @DisplayName("Aluno não pode conceder graduação (concedida pela equipe)")
    void alunoNaoConcede() throws Exception {
        Faixa azul = faixas.get(1);
        mockMvc.perform(post("/api/graduacoes")
                        .header("Authorization", "Bearer " + alunoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoGraduacao(azul, 0)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Professor concede e a faixa atual do aluno reflete a graduação")
    void professorConcedeEFaixaAtualReflete() throws Exception {
        Faixa azul = faixas.get(1);

        mockMvc.perform(post("/api/graduacoes")
                        .header("Authorization", "Bearer " + professorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoGraduacao(azul, 2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.faixaNome").value("Azul"))
                .andExpect(jsonPath("$.cor").value("AZUL"))
                .andExpect(jsonPath("$.grau").value(2))
                .andExpect(jsonPath("$.concedidaPorNome").value(professor.getNome()));

        // Faixa atual vista pela equipe
        mockMvc.perform(get("/api/alunos/" + aluno.getId() + "/progressao")
                        .header("Authorization", "Bearer " + professorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].cor").value("AZUL"))
                .andExpect(jsonPath("$[0].grau").value(2));

        // Progressão própria do aluno (Início/Perfil)
        mockMvc.perform(get("/api/eu/progressao")
                        .header("Authorization", "Bearer " + alunoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].faixaNome").value("Azul"));
    }

    @Test
    @DisplayName("Equipe lista alunos; aluno não tem acesso à seção de coaching")
    void listaDeAlunosRestritaAEquipe() throws Exception {
        mockMvc.perform(get("/api/alunos")
                        .header("Authorization", "Bearer " + professorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + aluno.getId() + ")]").isNotEmpty());

        mockMvc.perform(get("/api/alunos")
                        .header("Authorization", "Bearer " + alunoToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Detalhe do aluno traz nome e total de check-ins (frequência)")
    void detalheDoAluno() throws Exception {
        mockMvc.perform(get("/api/alunos/" + aluno.getId())
                        .header("Authorization", "Bearer " + professorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value(aluno.getNome()))
                .andExpect(jsonPath("$.totalCheckins").value(0));
    }

    @Test
    @DisplayName("Conceder graduação gera notificação in-app para o aluno")
    void concederGeraNotificacao() throws Exception {
        Faixa azul = faixas.get(1);

        mockMvc.perform(post("/api/graduacoes")
                        .header("Authorization", "Bearer " + professorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoGraduacao(azul, 1)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/notificacoes").header("Authorization", "Bearer " + alunoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].tipo").value("GRADUACAO"))
                .andExpect(jsonPath("$[0].lida").value(false));

        mockMvc.perform(get("/api/notificacoes/nao-lidas").header("Authorization", "Bearer " + alunoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(1));
    }

    @Test
    @DisplayName("Admin cria modalidade e faixa; Professor não pode configurar")
    void configuracaoRestritaAoAdmin() throws Exception {
        // Admin cria uma modalidade
        mockMvc.perform(post("/api/modalidades")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Muay Thai\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Muay Thai"));

        // Admin adiciona uma faixa na modalidade seed
        mockMvc.perform(post("/api/modalidades/" + jiujitsu.getId() + "/faixas")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Coral\",\"cor\":\"PRETA\",\"ordem\":6,\"grausMax\":0}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Coral"));

        // Professor não pode configurar
        mockMvc.perform(post("/api/modalidades")
                        .header("Authorization", "Bearer " + professorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Judo\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Grau acima do máximo da faixa é rejeitado com 422")
    void grauInvalidoRejeitado() throws Exception {
        Faixa azul = faixas.get(1); // grausMax 4

        mockMvc.perform(post("/api/graduacoes")
                        .header("Authorization", "Bearer " + professorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoGraduacao(azul, 9)))
                .andExpect(status().isUnprocessableEntity());
    }
}
