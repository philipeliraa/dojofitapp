package com.dojofit.api.repository;

import com.dojofit.api.model.Graduacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GraduacaoRepository extends JpaRepository<Graduacao, Long> {

    /** Graduação mais recente do aluno numa modalidade = faixa atual. */
    Optional<Graduacao> findFirstByAlunoIdAndModalidadeIdOrderByDataDescIdDesc(Long alunoId, Long modalidadeId);

    /** Histórico (linha do tempo) de graduações do aluno, mais recente primeiro. */
    List<Graduacao> findByAlunoIdOrderByDataDescIdDesc(Long alunoId);
}
