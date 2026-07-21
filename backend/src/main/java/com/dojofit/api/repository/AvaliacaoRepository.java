package com.dojofit.api.repository;

import com.dojofit.api.model.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {

    List<Avaliacao> findByAlunoIdOrderByCriadoEmDesc(Long alunoId);

    List<Avaliacao> findByAlunoIdAndPublicoTrueOrderByCriadoEmDesc(Long alunoId);
}
