package com.dojofit.api.repository;

import com.dojofit.api.model.Checkin;
import com.dojofit.api.model.enums.StatusCheckin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CheckinRepository extends JpaRepository<Checkin, Long> {

    Optional<Checkin> findByClientId(UUID clientId);

    Optional<Checkin> findByAulaIdAndAlunoId(Long aulaId, Long alunoId);

    List<Checkin> findByAulaId(Long aulaId);

    List<Checkin> findByAulaIdAndStatus(Long aulaId, StatusCheckin status);

    @Query("SELECT COUNT(c) FROM Checkin c WHERE c.aluno.id = :alunoId AND c.aula.data BETWEEN :start AND :end AND c.status <> 'LISTA_ESPERA'")
    long countCheckinsInWeek(Long alunoId, LocalDate start, LocalDate end);

    @Query("SELECT c.aula.data FROM Checkin c WHERE c.aluno.id = :alunoId AND c.status <> 'LISTA_ESPERA'")
    List<LocalDate> findTrainingDatesByAlunoId(Long alunoId);

    long countByAulaIdAndStatus(Long aulaId, StatusCheckin status);

    @Query("SELECT c FROM Checkin c JOIN FETCH c.aula a LEFT JOIN FETCH a.turma WHERE c.aluno.id = :alunoId ORDER BY c.dataHoraCheckin DESC")
    List<Checkin> findHistoricoByAlunoId(Long alunoId);
}
