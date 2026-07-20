package com.dojofit.api.repository;

import com.dojofit.api.model.Faixa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FaixaRepository extends JpaRepository<Faixa, Long> {

    List<Faixa> findByModalidadeIdOrderByOrdemAsc(Long modalidadeId);
}
