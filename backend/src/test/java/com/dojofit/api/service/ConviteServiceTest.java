package com.dojofit.api.service;

import com.dojofit.api.dto.request.ConviteRequest;
import com.dojofit.api.exception.BusinessException;
import com.dojofit.api.model.Convite;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.model.enums.Role;
import com.dojofit.api.repository.ConviteRepository;
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
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ConviteServiceTest {

    @Mock
    private ConviteRepository conviteRepository;
    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private ConviteService conviteService;

    private Usuario admin;
    private Usuario professor;

    @BeforeEach
    void setUp() {
        admin = new Usuario();
        admin.setId(1L);
        admin.setNome("Admin");
        admin.setRole(Role.ADMIN);

        professor = new Usuario();
        professor.setId(2L);
        professor.setNome("Professor");
        professor.setRole(Role.PROFESSOR);
    }

    private Convite conviteValido() {
        var convite = new Convite();
        convite.setId(10L);
        convite.setToken(UUID.randomUUID());
        convite.setEmail("novo@dojofit.com");
        convite.setRole(Role.ALUNO);
        convite.setCriadoPor(admin);
        convite.setExpiraEm(LocalDateTime.now().plusDays(7));
        return convite;
    }

    @Test
    @DisplayName("Admin cria convite com token e validade de 7 dias")
    void adminCreatesInviteWithTokenAndExpiration() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(usuarioRepository.findByEmail("novo@dojofit.com")).thenReturn(Optional.empty());
        when(conviteRepository.save(any(Convite.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = conviteService.criar(new ConviteRequest("novo@dojofit.com", Role.PROFESSOR), 1L);

        var captor = ArgumentCaptor.forClass(Convite.class);
        verify(conviteRepository).save(captor.capture());
        assertNotNull(captor.getValue().getToken());
        assertTrue(captor.getValue().getExpiraEm().isAfter(LocalDateTime.now().plusDays(6)));
        assertEquals("PROFESSOR", response.role());
    }

    @Test
    @DisplayName("Professor só pode convidar alunos (docs/02 seção 2)")
    void professorCanOnlyInviteStudents() {
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(professor));

        assertThrows(BusinessException.class,
                () -> conviteService.criar(new ConviteRequest("novo@dojofit.com", Role.ADMIN), 2L));
        verify(conviteRepository, never()).save(any());
    }

    @Test
    @DisplayName("Email já cadastrado não recebe convite")
    void rejectsInviteForExistingEmail() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(usuarioRepository.findByEmail("existe@dojofit.com")).thenReturn(Optional.of(new Usuario()));

        assertThrows(BusinessException.class,
                () -> conviteService.criar(new ConviteRequest("existe@dojofit.com", Role.ALUNO), 1L));
    }

    @Test
    @DisplayName("Convite válido passa na validação")
    void validInviteIsAccepted() {
        var convite = conviteValido();
        when(conviteRepository.findByToken(convite.getToken())).thenReturn(Optional.of(convite));

        assertEquals(convite, conviteService.validar(convite.getToken()));
    }

    @Test
    @DisplayName("Convite inexistente é rejeitado com a mensagem de acesso por convite (docs/06)")
    void unknownTokenIsRejected() {
        var token = UUID.randomUUID();
        when(conviteRepository.findByToken(token)).thenReturn(Optional.empty());

        var ex = assertThrows(BusinessException.class, () -> conviteService.validar(token));
        assertTrue(ex.getMessage().contains("requer convite da academia"));
    }

    @Test
    @DisplayName("Convite é de uso único")
    void usedInviteIsRejected() {
        var convite = conviteValido();
        convite.setUsadoEm(LocalDateTime.now().minusHours(1));
        when(conviteRepository.findByToken(convite.getToken())).thenReturn(Optional.of(convite));

        assertThrows(BusinessException.class, () -> conviteService.validar(convite.getToken()));
    }

    @Test
    @DisplayName("Convite expirado é rejeitado")
    void expiredInviteIsRejected() {
        var convite = conviteValido();
        convite.setExpiraEm(LocalDateTime.now().minusDays(1));
        when(conviteRepository.findByToken(convite.getToken())).thenReturn(Optional.of(convite));

        assertThrows(BusinessException.class, () -> conviteService.validar(convite.getToken()));
    }
}
