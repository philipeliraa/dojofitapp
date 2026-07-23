package com.dojofit.api.controller;

import com.dojofit.api.AbstractIntegrationTest;
import com.dojofit.api.config.JwtUtil;
import com.dojofit.api.model.Aula;
import com.dojofit.api.model.Contrato;
import com.dojofit.api.model.Plano;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.model.enums.Role;
import com.dojofit.api.model.enums.StatusContrato;
import com.dojofit.api.repository.AulaRepository;
import com.dojofit.api.repository.CheckinRepository;
import com.dojofit.api.repository.ContratoRepository;
import com.dojofit.api.repository.PlanoRepository;
import com.dojofit.api.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Teste bloqueante da Fase 1a (docs/08 seção 3): enviar o mesmo UUID duas
 * vezes ao endpoint de check-in não pode duplicar o registro — é a proteção
 * que sustenta a fila offline definida em docs/05 e docs/07.
 */
@AutoConfigureMockMvc
class CheckinIdempotencyTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private PlanoRepository planoRepository;
    @Autowired
    private ContratoRepository contratoRepository;
    @Autowired
    private AulaRepository aulaRepository;
    @Autowired
    private CheckinRepository checkinRepository;

    private Usuario aluno;
    private Aula aula;
    private String alunoToken;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);

        var professor = new Usuario();
        professor.setNome("Professor Teste");
        professor.setEmail("professor-" + suffix + "@dojofit.com");
        professor.setRole(Role.PROFESSOR);
        professor.setAcademia(academiaPadrao());
        usuarioRepository.save(professor);

        aluno = new Usuario();
        aluno.setNome("Aluno Teste");
        aluno.setEmail("aluno-" + suffix + "@dojofit.com");
        aluno.setRole(Role.ALUNO);
        aluno.setAcademia(academiaPadrao());
        usuarioRepository.save(aluno);

        var plano = new Plano();
        plano.setNome("Plano teste " + suffix);
        plano.setLimiteSemanal(5);
        planoRepository.save(plano);

        var contrato = new Contrato();
        contrato.setAluno(aluno);
        contrato.setPlano(plano);
        contrato.setDataInicio(LocalDate.now().minusMonths(1));
        contrato.setDataValidade(LocalDate.now().plusMonths(1));
        contrato.setStatus(StatusContrato.ATIVO);
        contratoRepository.save(contrato);

        aula = new Aula();
        aula.setData(LocalDate.now());
        // Janela ampla: aula "acontecendo" o dia todo, para o check-in valer em
        // qualquer horário de execução do teste (regra "aula ja encerrou").
        aula.setHoraInicio(LocalTime.of(0, 0));
        aula.setHoraFim(LocalTime.of(23, 59));
        aula.setCapacidadeMaxima(20);
        aula.setProfessor(professor);
        aulaRepository.save(aula);

        alunoToken = jwtUtil.generateToken(aluno);
    }

    @Test
    @DisplayName("Mesmo clientId enviado duas vezes não duplica o check-in")
    void sameClientIdSentTwiceDoesNotDuplicateCheckin() throws Exception {
        UUID clientId = UUID.randomUUID();
        String body = """
                {"aulaId": %d, "clientId": "%s"}
                """.formatted(aula.getId(), clientId);

        mockMvc.perform(post("/api/checkins")
                        .header("Authorization", "Bearer " + alunoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMADO"))
                .andExpect(jsonPath("$.clientId").value(clientId.toString()));

        // Reenvio idêntico (simula retry da fila offline)
        mockMvc.perform(post("/api/checkins")
                        .header("Authorization", "Bearer " + alunoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMADO"))
                .andExpect(jsonPath("$.clientId").value(clientId.toString()));

        assertEquals(1, checkinRepository.findByAulaId(aula.getId()).size());
    }

    @Test
    @DisplayName("Check-in sem clientId é rejeitado com 400")
    void checkinWithoutClientIdIsRejected() throws Exception {
        String body = """
                {"aulaId": %d}
                """.formatted(aula.getId());

        mockMvc.perform(post("/api/checkins")
                        .header("Authorization", "Bearer " + alunoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Check-in em aula de outro dia é rejeitado (docs/01)")
    void checkinOnAnotherDayIsRejected() throws Exception {
        aula.setData(LocalDate.now().plusDays(1));
        aulaRepository.save(aula);

        String body = """
                {"aulaId": %d, "clientId": "%s"}
                """.formatted(aula.getId(), UUID.randomUUID());

        mockMvc.perform(post("/api/checkins")
                        .header("Authorization", "Bearer " + alunoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value("Check-in permitido apenas no dia da aula"));

        assertEquals(0, checkinRepository.findByAulaId(aula.getId()).size());
    }
}
