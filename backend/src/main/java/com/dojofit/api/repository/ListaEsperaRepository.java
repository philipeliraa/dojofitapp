package com.dojofit.api.repository;

import com.dojofit.api.model.ListaEspera;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ListaEsperaRepository extends JpaRepository<ListaEspera, Long> {

    List<ListaEspera> findByAulaIdOrderByPosicaoAsc(Long aulaId);

    Optional<ListaEspera> findByAulaIdAndAlunoId(Long aulaId, Long alunoId);

    Optional<ListaEspera> findFirstByAulaIdOrderByPosicaoAsc(Long aulaId);

    long countByAulaId(Long aulaId);
}
