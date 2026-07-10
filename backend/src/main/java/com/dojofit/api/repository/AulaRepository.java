package com.dojofit.api.repository;

import com.dojofit.api.model.Aula;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AulaRepository extends JpaRepository<Aula, Long> {

    List<Aula> findByData(LocalDate data);

    List<Aula> findByDataBetween(LocalDate start, LocalDate end);

    Optional<Aula> findByTurmaIdAndData(Long turmaId, LocalDate data);

    List<Aula> findByDataAndCanceladaFalse(LocalDate data);
}
