package com.dojofit.api.service;

import com.dojofit.api.dto.request.FeedbackAvisoRequest;
import com.dojofit.api.model.Aviso;
import com.dojofit.api.model.FeedbackAviso;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.model.enums.Role;
import com.dojofit.api.repository.AvisoRepository;
import com.dojofit.api.repository.FeedbackAvisoRepository;
import com.dojofit.api.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FeedbackAvisoServiceTest {

    @Mock
    private FeedbackAvisoRepository feedbackAvisoRepository;
    @Mock
    private AvisoRepository avisoRepository;
    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private FeedbackAvisoService feedbackAvisoService;

    private Usuario aluno;
    private Usuario outroAluno;
    private Usuario professor;
    private Aviso aviso;

    @BeforeEach
    void setUp() {
        aluno = usuario(2L, "Aluno Joao", Role.ALUNO);
        outroAluno = usuario(3L, "Aluna Maria", Role.ALUNO);
        professor = usuario(1L, "Professor Carlos", Role.PROFESSOR);

        aviso = new Aviso();
        aviso.setId(10L);
        aviso.setTitulo("Aviso");
        aviso.setAutor(professor);
    }

    private Usuario usuario(Long id, String nome, Role role) {
        var u = new Usuario();
        u.setId(id);
        u.setNome(nome);
        u.setRole(role);
        return u;
    }

    private FeedbackAviso feedback(Long id, Usuario autor) {
        var f = new FeedbackAviso();
        f.setId(id);
        f.setAviso(aviso);
        f.setAutor(autor);
        f.setConteudo("Comentario");
        return f;
    }

    @Test
    @DisplayName("Professor/Admin vê todos os feedbacks do aviso")
    void equipeVeTodosFeedbacks() {
        when(feedbackAvisoRepository.findByAvisoIdOrderByCriadoEmAsc(10L))
                .thenReturn(List.of(feedback(1L, aluno), feedback(2L, outroAluno)));

        var visiveis = feedbackAvisoService.listarVisiveis(10L, professor);

        assertEquals(2, visiveis.size());
        verify(feedbackAvisoRepository).findByAvisoIdOrderByCriadoEmAsc(10L);
        verify(feedbackAvisoRepository, never()).findByAvisoIdAndAutorIdOrderByCriadoEmAsc(anyLong(), anyLong());
    }

    @Test
    @DisplayName("Aluno vê apenas os próprios feedbacks (privacidade)")
    void alunoVeApenasOsProprios() {
        when(feedbackAvisoRepository.findByAvisoIdAndAutorIdOrderByCriadoEmAsc(10L, 2L))
                .thenReturn(List.of(feedback(1L, aluno)));

        var visiveis = feedbackAvisoService.listarVisiveis(10L, aluno);

        assertEquals(1, visiveis.size());
        assertEquals(2L, visiveis.get(0).autorId());
        verify(feedbackAvisoRepository).findByAvisoIdAndAutorIdOrderByCriadoEmAsc(10L, 2L);
        verify(feedbackAvisoRepository, never()).findByAvisoIdOrderByCriadoEmAsc(anyLong());
    }

    @Test
    @DisplayName("Adicionar feedback vincula aviso e autor")
    void adicionarVinculaAvisoEAutor() {
        when(avisoRepository.findById(10L)).thenReturn(Optional.of(aviso));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(aluno));
        when(feedbackAvisoRepository.save(any(FeedbackAviso.class))).thenAnswer(inv -> {
            FeedbackAviso f = inv.getArgument(0);
            f.setId(99L);
            return f;
        });

        var response = feedbackAvisoService.adicionar(10L, 2L, new FeedbackAvisoRequest("Vou estar la!"));

        assertEquals(10L, response.avisoId());
        assertEquals(2L, response.autorId());
        assertEquals("Vou estar la!", response.conteudo());
    }

    @Test
    @DisplayName("Autor pode remover o próprio feedback")
    void autorRemoveOProprio() {
        when(feedbackAvisoRepository.findById(1L)).thenReturn(Optional.of(feedback(1L, aluno)));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(aluno));

        feedbackAvisoService.deletar(10L, 1L, 2L);

        verify(feedbackAvisoRepository).delete(any(FeedbackAviso.class));
    }

    @Test
    @DisplayName("Professor/Admin pode remover feedback de qualquer aluno (moderação)")
    void equipeRemoveFeedbackAlheio() {
        when(feedbackAvisoRepository.findById(1L)).thenReturn(Optional.of(feedback(1L, aluno)));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(professor));

        feedbackAvisoService.deletar(10L, 1L, 1L);

        verify(feedbackAvisoRepository).delete(any(FeedbackAviso.class));
    }

    @Test
    @DisplayName("Outro aluno não pode remover feedback alheio")
    void outroAlunoNaoRemoveFeedbackAlheio() {
        when(feedbackAvisoRepository.findById(1L)).thenReturn(Optional.of(feedback(1L, aluno)));
        when(usuarioRepository.findById(3L)).thenReturn(Optional.of(outroAluno));

        assertThrows(AccessDeniedException.class, () -> feedbackAvisoService.deletar(10L, 1L, 3L));
        verify(feedbackAvisoRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Feedback de outro aviso na URL é tratado como não encontrado")
    void feedbackDeOutroAvisoNaoEncontrado() {
        when(feedbackAvisoRepository.findById(1L)).thenReturn(Optional.of(feedback(1L, aluno)));

        assertThrows(EntityNotFoundException.class, () -> feedbackAvisoService.deletar(999L, 1L, 2L));
        verify(feedbackAvisoRepository, never()).delete(any());
    }
}
