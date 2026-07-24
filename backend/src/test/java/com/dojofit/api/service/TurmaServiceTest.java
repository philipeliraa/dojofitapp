package com.dojofit.api.service;

import com.dojofit.api.dto.request.TurmaRequest;
import com.dojofit.api.exception.BusinessException;
import com.dojofit.api.model.Turma;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.repository.TurmaRepository;
import com.dojofit.api.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TurmaServiceTest {

    @Mock
    private TurmaRepository turmaRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private AulaService aulaService;

    @InjectMocks
    private TurmaService turmaService;

    private static final Long PROFESSOR_ID = 5L;

    private Usuario professor;

    @BeforeEach
    void setUp() {
        professor = new Usuario();
        professor.setId(PROFESSOR_ID);
        professor.setNome("Professor Teste");
    }

    @Test
    @DisplayName("Nao permite criar turma cuja hora fim atravessa a meia-noite (igual a hora inicio)")
    void naoPermiteCriarTurmaComHoraFimIgualHoraInicio() {
        var request = new TurmaRequest("Jiu-jitsu Noite", "MON", "23:00", "23:00", 20, PROFESSOR_ID);
        when(usuarioRepository.findById(PROFESSOR_ID)).thenReturn(Optional.of(professor));

        assertThrows(BusinessException.class, () -> turmaService.create(request));
        verify(turmaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Nao permite criar turma cuja hora fim e antes da hora inicio (atravessa a meia-noite)")
    void naoPermiteCriarTurmaQueAtravessaMeiaNoite() {
        var request = new TurmaRequest("Jiu-jitsu Noite", "MON", "23:00", "00:00", 20, PROFESSOR_ID);
        when(usuarioRepository.findById(PROFESSOR_ID)).thenReturn(Optional.of(professor));

        var ex = assertThrows(BusinessException.class, () -> turmaService.create(request));
        assertTrue(ex.getMessage().toLowerCase().contains("meia-noite"));
        verify(turmaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Permite criar turma com horario valido dentro do mesmo dia")
    void permiteCriarTurmaComHorarioValido() {
        var request = new TurmaRequest("Jiu-jitsu Manha", "MON", "06:00", "07:00", 20, PROFESSOR_ID);
        when(usuarioRepository.findById(PROFESSOR_ID)).thenReturn(Optional.of(professor));
        when(turmaRepository.save(any(Turma.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(() -> turmaService.create(request));
        verify(turmaRepository).save(any(Turma.class));
    }

    @Test
    @DisplayName("Nao permite atualizar turma para horario que atravessa a meia-noite")
    void naoPermiteAtualizarTurmaQueAtravessaMeiaNoite() {
        var turmaExistente = new Turma();
        turmaExistente.setId(1L);
        when(turmaRepository.findById(1L)).thenReturn(Optional.of(turmaExistente));
        when(usuarioRepository.findById(PROFESSOR_ID)).thenReturn(Optional.of(professor));

        var request = new TurmaRequest("Jiu-jitsu Noite", "MON", "23:00", "00:30", 20, PROFESSOR_ID);

        assertThrows(BusinessException.class, () -> turmaService.update(1L, request));
        verify(turmaRepository, never()).save(any());
    }
}
