package com.dojofit.api.repository;

import com.dojofit.api.model.Turma;
import com.dojofit.api.model.enums.DiaSemana;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TurmaRepository extends JpaRepository<Turma, Long> {

    List<Turma> findByDiaSemanaAndAtivoTrue(DiaSemana diaSemana);

    List<Turma> findByAtivoTrue();
}
