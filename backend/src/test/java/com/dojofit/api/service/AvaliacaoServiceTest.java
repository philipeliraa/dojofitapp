package com.dojofit.api.service;

import com.dojofit.api.dto.request.AvaliacaoRequest;
import com.dojofit.api.model.Avaliacao;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.model.enums.Role;
import com.dojofit.api.model.enums.TipoAvaliacao;
import com.dojofit.api.repository.AvaliacaoRepository;
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

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AvaliacaoServiceTest {

    @Mock
    private AvaliacaoRepository avaliacaoRepository;
    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private AvaliacaoService service;

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
    @DisplayName("Registrar salva com tipo, conteúdo e visibilidade")
    void registrarSalva() {
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(aluno));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(professor));
        when(avaliacaoRepository.save(any(Avaliacao.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = service.registrar(2L,
                new AvaliacaoRequest(TipoAvaliacao.RECOMENDACAO, "Trabalhar a defesa de guarda", true), 1L);

        var captor = ArgumentCaptor.forClass(Avaliacao.class);
        verify(avaliacaoRepository).save(captor.capture());
        assertEquals(aluno, captor.getValue().getAluno());
        assertEquals(professor, captor.getValue().getAutor());
        assertEquals(TipoAvaliacao.RECOMENDACAO, response.tipo());
        assertTrue(response.publico());
    }

    @Test
    @DisplayName("Visão do aluno usa só as públicas (nota privada não vaza)")
    void listarPublicasUsaRepoDePublicas() {
        when(avaliacaoRepository.findByAlunoIdAndPublicoTrueOrderByCriadoEmDesc(2L)).thenReturn(List.of());

        service.listarPublicasDoAluno(2L);

        verify(avaliacaoRepository).findByAlunoIdAndPublicoTrueOrderByCriadoEmDesc(2L);
        verify(avaliacaoRepository, never()).findByAlunoIdOrderByCriadoEmDesc(any());
    }

    @Test
    @DisplayName("Atualizar avaliação de outro aluno na URL é tratado como não encontrado")
    void atualizarDeOutroAlunoFalha() {
        var avaliacao = new Avaliacao();
        avaliacao.setId(50L);
        avaliacao.setAluno(aluno);
        when(avaliacaoRepository.findById(50L)).thenReturn(Optional.of(avaliacao));

        assertThrows(EntityNotFoundException.class, () -> service.atualizar(999L, 50L,
                new AvaliacaoRequest(TipoAvaliacao.OBSERVACAO, "x", false)));
        verify(avaliacaoRepository, never()).save(any());
    }
}
