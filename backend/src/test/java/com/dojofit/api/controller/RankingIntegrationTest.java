package com.dojofit.api.controller;

import com.dojofit.api.AbstractIntegrationTest;
import com.dojofit.api.config.JwtUtil;
import com.dojofit.api.model.Aula;
import com.dojofit.api.model.Checkin;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.model.enums.Role;
import com.dojofit.api.model.enums.StatusCheckin;
import com.dojofit.api.model.enums.TipoCheckin;
import com.dojofit.api.dto.response.RankingItemResponse;
import com.dojofit.api.repository.AulaRepository;
import com.dojofit.api.repository.CheckinRepository;
import com.dojofit.api.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Fase 4 — ranking. Ordena por nº de treinos (check-ins) no mês corrente; a
 * posição reflete a ordem e o total.
 */
@AutoConfigureMockMvc
@Transactional
class RankingIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private AulaRepository aulaRepository;
    @Autowired
    private CheckinRepository checkinRepository;
    @Autowired
    private ObjectMapper objectMapper;

    private Usuario professor;
    private Usuario alunoMaisAtivo;
    private Usuario alunoMenosAtivo;
    private String token;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        professor = novoUsuario("prof-" + suffix, Role.PROFESSOR);
        alunoMaisAtivo = novoUsuario("ativo-" + suffix, Role.ALUNO);
        alunoMenosAtivo = novoUsuario("menos-" + suffix, Role.ALUNO);
        token = jwtUtil.generateToken(alunoMaisAtivo);

        Aula aula1 = novaAula();
        Aula aula2 = novaAula();
        // aluno mais ativo: 2 treinos; menos ativo: 1
        checkin(aula1, alunoMaisAtivo);
        checkin(aula2, alunoMaisAtivo);
        checkin(aula1, alunoMenosAtivo);
    }

    private Usuario novoUsuario(String slug, Role role) {
        var u = new Usuario();
        u.setNome(slug);
        u.setEmail(slug + "@dojofit.com");
        u.setRole(role);
        return usuarioRepository.save(u);
    }

    private Aula novaAula() {
        var aula = new Aula();
        aula.setData(LocalDate.now());
        aula.setHoraInicio(LocalTime.of(19, 0));
        aula.setHoraFim(LocalTime.of(20, 0));
        aula.setCapacidadeMaxima(20);
        aula.setProfessor(professor);
        return aulaRepository.save(aula);
    }

    private void checkin(Aula aula, Usuario aluno) {
        var c = new Checkin();
        c.setClientId(UUID.randomUUID());
        c.setAula(aula);
        c.setAluno(aluno);
        c.setTipo(TipoCheckin.PROPRIO);
        c.setStatus(StatusCheckin.CONFIRMADO);
        checkinRepository.save(c);
    }

    @Test
    @DisplayName("Ranking ordena por nº de treinos no mês, com posição sequencial")
    void rankingOrdenadoPorTreinos() throws Exception {
        String json = mockMvc.perform(get("/api/ranking").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        var ranking = Arrays.asList(objectMapper.readValue(json, RankingItemResponse[].class));

        // Robusto a outros alunos no mês (ex: dados de outros testes de integração):
        // localiza os dois alunos deste teste pelo id.
        var maisAtivo = ranking.stream().filter(i -> i.alunoId().equals(alunoMaisAtivo.getId())).findFirst().orElseThrow();
        var menosAtivo = ranking.stream().filter(i -> i.alunoId().equals(alunoMenosAtivo.getId())).findFirst().orElseThrow();

        assertEquals(2, maisAtivo.totalTreinos());
        assertEquals(1, menosAtivo.totalTreinos());
        // 2 treinos é o máximo do mês nos testes -> primeiro lugar; e vem antes do menos ativo
        assertEquals(1, maisAtivo.posicao());
        assertTrue(maisAtivo.posicao() < menosAtivo.posicao());
    }
}
