package com.dojofit.api.controller;

import com.dojofit.api.AbstractIntegrationTest;
import com.dojofit.api.config.JwtUtil;
import com.dojofit.api.model.Aula;
import com.dojofit.api.model.Checkin;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.model.enums.Role;
import com.dojofit.api.model.enums.StatusCheckin;
import com.dojofit.api.model.enums.TipoCheckin;
import com.dojofit.api.repository.AulaRepository;
import com.dojofit.api.repository.CheckinRepository;
import com.dojofit.api.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Segurança do cancelamento de check-in: só o próprio aluno (ou a equipe) pode
 * cancelar. Um aluno não pode cancelar o check-in de outro por id (IDOR).
 */
@AutoConfigureMockMvc
@Transactional
class CheckinCancelIntegrationTest extends AbstractIntegrationTest {

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

    private Usuario alunoDono;
    private String tokenDono;
    private String tokenOutroAluno;
    private Checkin checkin;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        Usuario professor = novoUsuario("prof-" + suffix, Role.PROFESSOR);
        alunoDono = novoUsuario("dono-" + suffix, Role.ALUNO);
        Usuario outro = novoUsuario("outro-" + suffix, Role.ALUNO);
        tokenDono = jwtUtil.generateToken(alunoDono);
        tokenOutroAluno = jwtUtil.generateToken(outro);

        var aula = new Aula();
        aula.setData(LocalDate.now());
        aula.setHoraInicio(LocalTime.of(0, 0));
        aula.setHoraFim(LocalTime.of(23, 59));
        aula.setCapacidadeMaxima(20);
        aula.setProfessor(professor);
        aulaRepository.save(aula);

        checkin = new Checkin();
        checkin.setClientId(UUID.randomUUID());
        checkin.setAula(aula);
        checkin.setAluno(alunoDono);
        checkin.setTipo(TipoCheckin.PROPRIO);
        checkin.setStatus(StatusCheckin.CONFIRMADO);
        checkinRepository.save(checkin);
    }

    private Usuario novoUsuario(String slug, Role role) {
        var u = new Usuario();
        u.setNome(slug);
        u.setEmail(slug + "@dojofit.com");
        u.setRole(role);
        u.setAcademia(academiaPadrao());
        return usuarioRepository.save(u);
    }

    @Test
    @DisplayName("Outro aluno não pode cancelar o check-in alheio (403) e ele permanece")
    void outroAlunoNaoCancela() throws Exception {
        mockMvc.perform(delete("/api/checkins/" + checkin.getId())
                        .header("Authorization", "Bearer " + tokenOutroAluno))
                .andExpect(status().isForbidden());

        assertTrue(checkinRepository.findById(checkin.getId()).isPresent());
    }

    @Test
    @DisplayName("O próprio aluno cancela o próprio check-in")
    void donoCancela() throws Exception {
        mockMvc.perform(delete("/api/checkins/" + checkin.getId())
                        .header("Authorization", "Bearer " + tokenDono))
                .andExpect(status().isOk());

        assertFalse(checkinRepository.findById(checkin.getId()).isPresent());
    }
}
