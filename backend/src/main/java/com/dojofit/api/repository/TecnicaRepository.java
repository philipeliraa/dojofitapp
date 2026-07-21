package com.dojofit.api.repository;

import com.dojofit.api.model.Tecnica;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TecnicaRepository extends JpaRepository<Tecnica, Long> {

    List<Tecnica> findByModalidadeIdAndAtivoTrueOrderByNomeAsc(Long modalidadeId);
}
