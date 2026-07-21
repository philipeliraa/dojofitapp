package com.dojofit.api.service;

import com.dojofit.api.dto.request.CampeonatoRequest;
import com.dojofit.api.model.Campeonato;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.model.enums.ResultadoCampeonato;
import com.dojofit.api.model.enums.Role;
import com.dojofit.api.repository.CampeonatoRepository;
import com.dojofit.api.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CampeonatoServiceTest {

    @Mock
    private CampeonatoRepository campeonatoRepository;
    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private CampeonatoService service;

    private Usuario aluno;
    private Usuario professor;

    @BeforeEach
    void setUp() {
        aluno = usuario(2L, Role.ALUNO);
        professor = usuario(1L, Role.PROFESSOR);
    }

    private Usuario usuario(Long id, Role role) {
        var u = new Usuario();
        u.setId(id);
        u.setNome("User " + id);
        u.setRole(role);
        return u;
    }

    @Test
    @DisplayName("Registrar salva com aluno, quem registrou e o resultado")
    void registrarSalva() {
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(aluno));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(professor));
        when(campeonatoRepository.save(any(Campeonato.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = service.registrar(2L,
                new CampeonatoRequest("Copa SP", LocalDate.of(2026, 5, 10), ResultadoCampeonato.OURO, "Adulto Azul Medio", null),
                1L);

        var captor = ArgumentCaptor.forClass(Campeonato.class);
        verify(campeonatoRepository).save(captor.capture());
        assertEquals(aluno, captor.getValue().getAluno());
        assertEquals(professor, captor.getValue().getRegistradoPor());
        assertEquals(ResultadoCampeonato.OURO, response.resultado());
        assertEquals("Copa SP", response.nome());
    }

    @Test
    @DisplayName("Atualizar campeonato de outro aluno na URL é tratado como não encontrado")
    void atualizarDeOutroAlunoFalha() {
        var campeonato = new Campeonato();
        campeonato.setId(50L);
        campeonato.setAluno(aluno); // pertence ao aluno 2
        when(campeonatoRepository.findById(50L)).thenReturn(Optional.of(campeonato));

        assertThrows(EntityNotFoundException.class, () -> service.atualizar(999L, 50L,
                new CampeonatoRequest("X", LocalDate.now(), ResultadoCampeonato.PRATA, null, null)));
        verify(campeonatoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Remover apaga o campeonato do aluno")
    void removerApaga() {
        var campeonato = new Campeonato();
        campeonato.setId(50L);
        campeonato.setAluno(aluno);
        when(campeonatoRepository.findById(50L)).thenReturn(Optional.of(campeonato));

        service.remover(2L, 50L);

        verify(campeonatoRepository).delete(campeonato);
    }
}
