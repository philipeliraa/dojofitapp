package com.dojofit.api.service;

import com.dojofit.api.exception.BusinessException;
import com.dojofit.api.model.Aula;
import com.dojofit.api.model.Checkin;
import com.dojofit.api.model.Contrato;
import com.dojofit.api.model.Plano;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.model.enums.StatusCheckin;
import com.dojofit.api.model.enums.StatusContrato;
import com.dojofit.api.model.enums.TipoCheckin;
import com.dojofit.api.repository.CheckinRepository;
import com.dojofit.api.repository.ContratoRepository;
import com.dojofit.api.repository.ListaEsperaRepository;
import com.dojofit.api.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CheckinServiceTest {

    @Mock
    private CheckinRepository checkinRepository;
    @Mock
    private ContratoRepository contratoRepository;
    @Mock
    private ListaEsperaRepository listaEsperaRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private AulaService aulaService;

    @InjectMocks
    private CheckinService checkinService;

    private static final Long AULA_ID = 10L;
    private static final Long ALUNO_ID = 1L;
    private static final UUID CLIENT_ID = UUID.randomUUID();

    private Usuario aluno;
    private Aula aula;
    private Contrato contrato;
    private Plano plano;

    @BeforeEach
    void setUp() {
        aluno = new Usuario();
        aluno.setId(ALUNO_ID);
        aluno.setNome("Aluno Teste");
        aluno.setEmail("aluno@dojofit.com");

        aula = new Aula();
        aula.setId(AULA_ID);
        aula.setData(LocalDate.now());
        aula.setHoraInicio(LocalTime.of(19, 0));
        aula.setHoraFim(LocalTime.of(20, 0));
        aula.setCapacidadeMaxima(10);
        aula.setCancelada(false);

        plano = new Plano();
        plano.setNome("3x por semana");
        plano.setLimiteSemanal(3);

        contrato = new Contrato();
        contrato.setAluno(aluno);
        contrato.setPlano(plano);
        contrato.setDataInicio(LocalDate.now().minusMonths(1));
        contrato.setDataValidade(LocalDate.now().plusMonths(1));
        contrato.setStatus(StatusContrato.ATIVO);
    }

    private void stubHappyPathUntilContract() {
        when(checkinRepository.findByClientId(CLIENT_ID)).thenReturn(Optional.empty());
        when(aulaService.getAula(AULA_ID)).thenReturn(aula);
        when(usuarioRepository.findById(ALUNO_ID)).thenReturn(Optional.of(aluno));
        when(contratoRepository.findByAlunoIdAndStatus(ALUNO_ID, StatusContrato.ATIVO))
                .thenReturn(Optional.of(contrato));
    }

    @Test
    @DisplayName("Idempotência: mesmo clientId retorna o check-in já processado, sem novo save")
    void returnsExistingCheckinWhenClientIdAlreadyProcessed() {
        var existente = new Checkin();
        existente.setId(99L);
        existente.setClientId(CLIENT_ID);
        existente.setAula(aula);
        existente.setAluno(aluno);
        existente.setTipo(TipoCheckin.PROPRIO);
        existente.setStatus(StatusCheckin.CONFIRMADO);
        when(checkinRepository.findByClientId(CLIENT_ID)).thenReturn(Optional.of(existente));

        var response = checkinService.realizarCheckin(AULA_ID, ALUNO_ID, TipoCheckin.PROPRIO, CLIENT_ID);

        assertEquals(99L, response.id());
        assertEquals(CLIENT_ID.toString(), response.clientId());
        assertEquals(StatusCheckin.CONFIRMADO.name(), response.status());
        verify(checkinRepository, never()).save(any());
    }

    @Test
    @DisplayName("Check-in só é permitido no dia da própria aula (docs/01)")
    void rejectsCheckinOnDifferentDay() {
        aula.setData(LocalDate.now().plusDays(1));
        when(checkinRepository.findByClientId(CLIENT_ID)).thenReturn(Optional.empty());
        when(aulaService.getAula(AULA_ID)).thenReturn(aula);
        when(usuarioRepository.findById(ALUNO_ID)).thenReturn(Optional.of(aluno));

        var ex = assertThrows(BusinessException.class,
                () -> checkinService.realizarCheckin(AULA_ID, ALUNO_ID, TipoCheckin.PROPRIO, CLIENT_ID));

        assertEquals("Check-in permitido apenas no dia da aula", ex.getMessage());
        verify(checkinRepository, never()).save(any());
    }

    @Test
    @DisplayName("Aluno é bloqueado ao atingir o limite semanal do plano")
    void rejectsSelfCheckinWhenWeeklyLimitReached() {
        stubHappyPathUntilContract();
        when(checkinRepository.findByAulaIdAndAlunoId(AULA_ID, ALUNO_ID)).thenReturn(Optional.empty());
        when(checkinRepository.countCheckinsInWeek(eq(ALUNO_ID), any(), any())).thenReturn(3L);

        assertThrows(BusinessException.class,
                () -> checkinService.realizarCheckin(AULA_ID, ALUNO_ID, TipoCheckin.PROPRIO, CLIENT_ID));
        verify(checkinRepository, never()).save(any());
    }

    @Test
    @DisplayName("Override do professor acima do limite gera exceção liberada (docs/06)")
    void grantsExceptionWhenProfessorChecksInAboveLimit() {
        stubHappyPathUntilContract();
        when(checkinRepository.findByAulaIdAndAlunoId(AULA_ID, ALUNO_ID)).thenReturn(Optional.empty());
        when(checkinRepository.countCheckinsInWeek(eq(ALUNO_ID), any(), any())).thenReturn(3L);
        when(checkinRepository.countByAulaIdAndStatus(eq(AULA_ID), any())).thenReturn(0L);
        when(checkinRepository.save(any(Checkin.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = checkinService.realizarCheckin(AULA_ID, ALUNO_ID, TipoCheckin.PROFESSOR, CLIENT_ID);

        assertEquals(StatusCheckin.EXCECAO_LIBERADA.name(), response.status());
    }

    @Test
    @DisplayName("Check-in dentro do limite é confirmado e grava o clientId recebido")
    void confirmsCheckinWithinLimitAndStoresClientId() {
        stubHappyPathUntilContract();
        when(checkinRepository.findByAulaIdAndAlunoId(AULA_ID, ALUNO_ID)).thenReturn(Optional.empty());
        when(checkinRepository.countCheckinsInWeek(eq(ALUNO_ID), any(), any())).thenReturn(1L);
        when(checkinRepository.countByAulaIdAndStatus(eq(AULA_ID), any())).thenReturn(0L);
        when(checkinRepository.save(any(Checkin.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = checkinService.realizarCheckin(AULA_ID, ALUNO_ID, TipoCheckin.PROPRIO, CLIENT_ID);

        var captor = ArgumentCaptor.forClass(Checkin.class);
        verify(checkinRepository).save(captor.capture());
        assertEquals(CLIENT_ID, captor.getValue().getClientId());
        assertEquals(StatusCheckin.CONFIRMADO.name(), response.status());
    }

    @Test
    @DisplayName("Aula lotada envia o aluno para a lista de espera")
    void sendsToWaitlistWhenClassIsFull() {
        stubHappyPathUntilContract();
        when(checkinRepository.findByAulaIdAndAlunoId(AULA_ID, ALUNO_ID)).thenReturn(Optional.empty());
        when(checkinRepository.countCheckinsInWeek(eq(ALUNO_ID), any(), any())).thenReturn(1L);
        when(checkinRepository.countByAulaIdAndStatus(AULA_ID, StatusCheckin.CONFIRMADO)).thenReturn(10L);
        when(checkinRepository.countByAulaIdAndStatus(AULA_ID, StatusCheckin.EXCECAO_LIBERADA)).thenReturn(0L);
        when(listaEsperaRepository.countByAulaId(AULA_ID)).thenReturn(0L);
        when(checkinRepository.save(any(Checkin.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = checkinService.realizarCheckin(AULA_ID, ALUNO_ID, TipoCheckin.PROPRIO, CLIENT_ID);

        assertEquals(StatusCheckin.LISTA_ESPERA.name(), response.status());
        verify(listaEsperaRepository).save(any());
    }

    @Test
    @DisplayName("Check-in duplicado na mesma aula (clientId diferente) segue bloqueado")
    void rejectsSecondCheckinForSameClass() {
        stubHappyPathUntilContract();
        when(checkinRepository.findByAulaIdAndAlunoId(AULA_ID, ALUNO_ID))
                .thenReturn(Optional.of(new Checkin()));

        assertThrows(BusinessException.class,
                () -> checkinService.realizarCheckin(AULA_ID, ALUNO_ID, TipoCheckin.PROPRIO, CLIENT_ID));
        verify(checkinRepository, never()).save(any());
    }

    @Test
    @DisplayName("Sem contrato ativo, check-in é bloqueado")
    void rejectsCheckinWithoutActiveContract() {
        when(checkinRepository.findByClientId(CLIENT_ID)).thenReturn(Optional.empty());
        when(aulaService.getAula(AULA_ID)).thenReturn(aula);
        when(usuarioRepository.findById(ALUNO_ID)).thenReturn(Optional.of(aluno));
        when(contratoRepository.findByAlunoIdAndStatus(anyLong(), any())).thenReturn(Optional.empty());

        assertThrows(BusinessException.class,
                () -> checkinService.realizarCheckin(AULA_ID, ALUNO_ID, TipoCheckin.PROPRIO, CLIENT_ID));
    }

    @Test
    @DisplayName("Contrato expirado bloqueia o check-in")
    void rejectsCheckinWithExpiredContract() {
        contrato.setDataValidade(LocalDate.now().minusDays(1));
        stubHappyPathUntilContract();

        assertThrows(BusinessException.class,
                () -> checkinService.realizarCheckin(AULA_ID, ALUNO_ID, TipoCheckin.PROPRIO, CLIENT_ID));
    }

    @Test
    @DisplayName("Aula cancelada bloqueia o check-in")
    void rejectsCheckinWhenClassIsCancelled() {
        aula.setCancelada(true);
        when(checkinRepository.findByClientId(CLIENT_ID)).thenReturn(Optional.empty());
        when(aulaService.getAula(AULA_ID)).thenReturn(aula);
        when(usuarioRepository.findById(ALUNO_ID)).thenReturn(Optional.of(aluno));

        assertThrows(BusinessException.class,
                () -> checkinService.realizarCheckin(AULA_ID, ALUNO_ID, TipoCheckin.PROPRIO, CLIENT_ID));
    }
}
