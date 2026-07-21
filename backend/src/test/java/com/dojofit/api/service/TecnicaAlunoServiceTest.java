package com.dojofit.api.service;

import com.dojofit.api.model.Modalidade;
import com.dojofit.api.model.Tecnica;
import com.dojofit.api.model.TecnicaAluno;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.model.enums.Role;
import com.dojofit.api.model.enums.StatusTecnica;
import com.dojofit.api.repository.TecnicaAlunoRepository;
import com.dojofit.api.repository.TecnicaRepository;
import com.dojofit.api.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TecnicaAlunoServiceTest {

    @Mock
    private TecnicaAlunoRepository tecnicaAlunoRepository;
    @Mock
    private TecnicaRepository tecnicaRepository;
    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private TecnicaAlunoService service;

    private Usuario aluno;
    private Usuario professor;
    private Tecnica armlock;

    @BeforeEach
    void setUp() {
        aluno = usuario(2L, Role.ALUNO);
        professor = usuario(1L, Role.PROFESSOR);

        var jiujitsu = new Modalidade();
        jiujitsu.setId(10L);
        jiujitsu.setNome("Jiu-Jitsu");

        armlock = new Tecnica();
        armlock.setId(100L);
        armlock.setNome("Armlock");
        armlock.setModalidade(jiujitsu);
    }

    private Usuario usuario(Long id, Role role) {
        var u = new Usuario();
        u.setId(id);
        u.setNome("User " + id);
        u.setRole(role);
        return u;
    }

    @Test
    @DisplayName("Definir status cria o registro quando não existe (upsert)")
    void definirCriaQuandoNaoExiste() {
        when(tecnicaAlunoRepository.findByAlunoIdAndTecnicaId(2L, 100L)).thenReturn(Optional.empty());
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(aluno));
        when(tecnicaRepository.findById(100L)).thenReturn(Optional.of(armlock));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(professor));
        when(tecnicaAlunoRepository.save(any(TecnicaAluno.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = service.definirStatus(2L, 100L, StatusTecnica.EM_DESENVOLVIMENTO, 1L);

        var captor = ArgumentCaptor.forClass(TecnicaAluno.class);
        verify(tecnicaAlunoRepository).save(captor.capture());
        assertEquals(aluno, captor.getValue().getAluno());
        assertEquals(armlock, captor.getValue().getTecnica());
        assertEquals(professor, captor.getValue().getAvaliadoPor());
        assertEquals(StatusTecnica.EM_DESENVOLVIMENTO, response.status());
    }

    @Test
    @DisplayName("Definir status atualiza o registro existente sem recriar")
    void definirAtualizaExistente() {
        var existente = new TecnicaAluno();
        existente.setAluno(aluno);
        existente.setTecnica(armlock);
        existente.setStatus(StatusTecnica.EM_DESENVOLVIMENTO);
        existente.setAtualizadoEm(LocalDateTime.now().minusDays(1));
        when(tecnicaAlunoRepository.findByAlunoIdAndTecnicaId(2L, 100L)).thenReturn(Optional.of(existente));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(professor));
        when(tecnicaAlunoRepository.save(any(TecnicaAluno.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = service.definirStatus(2L, 100L, StatusTecnica.DOMINADA, 1L);

        assertEquals(StatusTecnica.DOMINADA, response.status());
        // Não recarrega aluno/técnica para atualizar (upsert eficiente)
        verify(tecnicaRepository, never()).findById(any());
        verify(usuarioRepository, never()).findById(2L);
    }

    @Test
    @DisplayName("Remover apaga o registro quando existe")
    void removerApagaQuandoExiste() {
        var existente = new TecnicaAluno();
        when(tecnicaAlunoRepository.findByAlunoIdAndTecnicaId(2L, 100L)).thenReturn(Optional.of(existente));

        service.remover(2L, 100L);

        verify(tecnicaAlunoRepository).delete(existente);
    }

    @Test
    @DisplayName("Remover é no-op quando o registro não existe")
    void removerNoOpQuandoNaoExiste() {
        when(tecnicaAlunoRepository.findByAlunoIdAndTecnicaId(2L, 100L)).thenReturn(Optional.empty());

        service.remover(2L, 100L);

        verify(tecnicaAlunoRepository, never()).delete(any());
    }
}
