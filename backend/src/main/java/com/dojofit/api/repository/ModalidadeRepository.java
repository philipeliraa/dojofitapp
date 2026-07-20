package com.dojofit.api.repository;

import com.dojofit.api.model.Modalidade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModalidadeRepository extends JpaRepository<Modalidade, Long> {

    List<Modalidade> findByAtivoTrueOrderByNomeAsc();
}
