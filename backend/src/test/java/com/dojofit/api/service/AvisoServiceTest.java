package com.dojofit.api.service;

import com.dojofit.api.dto.request.AvisoRequest;
import com.dojofit.api.model.Aviso;
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
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AvisoServiceTest {

    @Mock
    private AvisoRepository avisoRepository;
    @Mock
    private FeedbackAvisoRepository feedbackAvisoRepository;
    @Mock
    private FeedbackAvisoService feedbackAvisoService;
    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private AvisoService avisoService;

    private Usuario professor;

    @BeforeEach
    void setUp() {
        professor = new Usuario();
        professor.setId(1L);
        professor.setNome("Professor Carlos");
        professor.setRole(Role.PROFESSOR);
    }

    private Aviso aviso(Long id, String titulo) {
        var aviso = new Aviso();
        aviso.setId(id);
        aviso.setTitulo(titulo);
        aviso.setConteudo("Conteudo de " + titulo);
        aviso.setAutor(professor);
        aviso.setCriadoEm(LocalDateTime.now());
        return aviso;
    }

    @Test
    @DisplayName("Criar aviso salva com autor e retorna nome do autor")
    void criarAvisoSalvaComAutor() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(professor));
        when(avisoRepository.save(any(Aviso.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = avisoService.criar(new AvisoRequest("Treino especial", "Sabado as 10h"), 1L);

        var captor = ArgumentCaptor.forClass(Aviso.class);
        verify(avisoRepository).save(captor.capture());
        assertEquals("Treino especial", captor.getValue().getTitulo());
        assertEquals(professor, captor.getValue().getAutor());
        assertEquals("Professor Carlos", response.autorNome());
        assertTrue(response.feedbacks().isEmpty());
    }

    @Test
    @DisplayName("Listar retorna avisos na ordem do repositório com feedbacks visíveis")
    void listarRetornaAvisosComFeedbacksVisiveis() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(professor));
        when(avisoRepository.findAllByOrderByCriadoEmDesc())
                .thenReturn(List.of(aviso(20L, "Novo"), aviso(10L, "Antigo")));
        when(feedbackAvisoService.listarVisiveis(anyLong(), any(Usuario.class))).thenReturn(List.of());

        var feed = avisoService.listar(1L);

        assertEquals(2, feed.size());
        assertEquals(20L, feed.get(0).id());
        assertEquals(10L, feed.get(1).id());
        // A privacidade é delegada ao FeedbackAvisoService, chamado por aviso
        verify(feedbackAvisoService).listarVisiveis(20L, professor);
        verify(feedbackAvisoService).listarVisiveis(10L, professor);
    }

    @Test
    @DisplayName("Deletar aviso remove primeiro os feedbacks associados")
    void deletarAvisoRemoveFeedbacksAntes() {
        var aviso = aviso(10L, "Aviso");
        when(avisoRepository.findById(10L)).thenReturn(Optional.of(aviso));

        avisoService.deletar(10L);

        var inOrder = inOrder(feedbackAvisoRepository, avisoRepository);
        inOrder.verify(feedbackAvisoRepository).deleteByAvisoId(10L);
        inOrder.verify(avisoRepository).delete(aviso);
    }

    @Test
    @DisplayName("Deletar aviso inexistente lança EntityNotFoundException")
    void deletarAvisoInexistenteFalha() {
        when(avisoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> avisoService.deletar(99L));
        verify(avisoRepository, never()).delete(any());
    }
}
