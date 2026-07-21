package com.dojofit.api.repository;

import com.dojofit.api.model.Campeonato;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CampeonatoRepository extends JpaRepository<Campeonato, Long> {

    List<Campeonato> findByAlunoIdOrderByDataDesc(Long alunoId);
}
