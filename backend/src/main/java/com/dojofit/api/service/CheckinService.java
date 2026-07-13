package com.dojofit.api.service;

import com.dojofit.api.dto.response.CheckinResponse;
import com.dojofit.api.exception.BusinessException;
import com.dojofit.api.model.Aula;
import com.dojofit.api.model.Checkin;
import com.dojofit.api.model.Contrato;
import com.dojofit.api.model.ListaEspera;
import com.dojofit.api.model.enums.StatusCheckin;
import com.dojofit.api.model.enums.StatusContrato;
import com.dojofit.api.model.enums.TipoCheckin;
import com.dojofit.api.repository.CheckinRepository;
import com.dojofit.api.repository.ContratoRepository;
import com.dojofit.api.repository.ListaEsperaRepository;
import com.dojofit.api.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CheckinService {

    private final CheckinRepository checkinRepository;
    private final ContratoRepository contratoRepository;
    private final ListaEsperaRepository listaEsperaRepository;
    private final UsuarioRepository usuarioRepository;
    private final AulaService aulaService;

    @Transactional
    public CheckinResponse realizarCheckin(Long aulaId, Long alunoId, TipoCheckin tipo) {
        var aula = aulaService.getAula(aulaId);
        var aluno = usuarioRepository.findById(alunoId)
                .orElseThrow(() -> new EntityNotFoundException("Aluno nao encontrado"));

        // Aula nao cancelada
        if (aula.getCancelada()) {
            throw new BusinessException("Esta aula foi cancelada");
        }

        // Contrato ativo e valido
        LocalDate today = LocalDate.now();
        Contrato contrato = contratoRepository.findByAlunoIdAndStatus(alunoId, StatusContrato.ATIVO)
                .orElseThrow(() -> new BusinessException("Voce nao possui contrato ativo. Procure o administrador"));

        if (contrato.getDataValidade().isBefore(today)) {
            throw new BusinessException("Seu contrato esta expirado. Procure o administrador");
        }

        // Sem check-in duplicado na mesma aula
        if (checkinRepository.findByAulaIdAndAlunoId(aulaId, alunoId).isPresent()) {
            throw new BusinessException("Voce ja fez check-in nesta aula");
        }

        // Limite semanal baseado no plano
        boolean limiteExcedido = false;
        if (contrato.getPlano().getLimiteSemanal() != null) {
            LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate sunday = monday.plusDays(6);
            long checkinsNaSemana = checkinRepository.countCheckinsInWeek(alunoId, monday, sunday);

            if (checkinsNaSemana >= contrato.getPlano().getLimiteSemanal()) {
                if (tipo == TipoCheckin.PROPRIO) {
                    throw new BusinessException("Limite semanal de " + contrato.getPlano().getLimiteSemanal() + " check-ins atingido. Peca liberacao ao professor");
                }
                limiteExcedido = true;
            }
        }

        // Rule 4: Capacidade
        long confirmados = checkinRepository.countByAulaIdAndStatus(aulaId, StatusCheckin.CONFIRMADO)
                + checkinRepository.countByAulaIdAndStatus(aulaId, StatusCheckin.EXCECAO_LIBERADA);

        StatusCheckin status;
        if (confirmados >= aula.getCapacidadeEfetiva()) {
            // Aula lotada -> lista de espera
            long posicao = listaEsperaRepository.countByAulaId(aulaId) + 1;
            var espera = new ListaEspera();
            espera.setAula(aula);
            espera.setAluno(aluno);
            espera.setPosicao((int) posicao);
            listaEsperaRepository.save(espera);
            status = StatusCheckin.LISTA_ESPERA;
        } else if (limiteExcedido) {
            status = StatusCheckin.EXCECAO_LIBERADA;
        } else {
            status = StatusCheckin.CONFIRMADO;
        }

        var checkin = new Checkin();
        checkin.setAula(aula);
        checkin.setAluno(aluno);
        checkin.setTipo(tipo);
        checkin.setStatus(status);
        checkinRepository.save(checkin);

        return CheckinResponse.from(checkin);
    }

    @Transactional
    public void cancelarCheckin(Long checkinId, Long userId) {
        var checkin = checkinRepository.findById(checkinId)
                .orElseThrow(() -> new EntityNotFoundException("Check-in nao encontrado"));

        Long aulaId = checkin.getAula().getId();
        boolean wasConfirmed = checkin.getStatus() == StatusCheckin.CONFIRMADO
                || checkin.getStatus() == StatusCheckin.EXCECAO_LIBERADA;

        // Remove waiting list entry if applicable
        listaEsperaRepository.findByAulaIdAndAlunoId(aulaId, checkin.getAluno().getId())
                .ifPresent(listaEsperaRepository::delete);

        checkinRepository.delete(checkin);

        // Rule 5: Promote next from waiting list
        if (wasConfirmed) {
            promoteFromWaitingList(aulaId);
        }
    }

    @Transactional
    public CheckinResponse liberarExcecao(Long checkinId) {
        var checkin = checkinRepository.findById(checkinId)
                .orElseThrow(() -> new EntityNotFoundException("Check-in nao encontrado"));

        checkin.setStatus(StatusCheckin.EXCECAO_LIBERADA);
        checkinRepository.save(checkin);
        return CheckinResponse.from(checkin);
    }

    public List<CheckinResponse> findByAula(Long aulaId) {
        return checkinRepository.findByAulaId(aulaId).stream()
                .map(CheckinResponse::from)
                .toList();
    }

    public List<CheckinResponse> findHistorico(Long alunoId) {
        return checkinRepository.findHistoricoByAlunoId(alunoId).stream()
                .map(CheckinResponse::from)
                .toList();
    }

    public long countCheckinsNaSemana(Long alunoId) {
        LocalDate today = LocalDate.now();
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate sunday = monday.plusDays(6);
        return checkinRepository.countCheckinsInWeek(alunoId, monday, sunday);
    }

    public java.util.Map<String, Object> getResumoSemanal(Long alunoId) {
        long count = countCheckinsNaSemana(alunoId);
        var result = new java.util.HashMap<String, Object>();
        result.put("count", count);

        contratoRepository.findByAlunoIdAndStatus(alunoId, StatusContrato.ATIVO)
                .ifPresent(contrato -> {
                    Integer limite = contrato.getPlano().getLimiteSemanal();
                    result.put("limite", limite);
                });

        return result;
    }

    private void promoteFromWaitingList(Long aulaId) {
        listaEsperaRepository.findFirstByAulaIdOrderByPosicaoAsc(aulaId).ifPresent(espera -> {
            // Change waiting list check-in to confirmed
            checkinRepository.findByAulaIdAndAlunoId(aulaId, espera.getAluno().getId()).ifPresent(checkin -> {
                checkin.setStatus(StatusCheckin.CONFIRMADO);
                checkinRepository.save(checkin);
            });
            listaEsperaRepository.delete(espera);
        });
    }
}
