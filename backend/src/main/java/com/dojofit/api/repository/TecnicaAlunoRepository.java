package com.dojofit.api.repository;

import com.dojofit.api.model.TecnicaAluno;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TecnicaAlunoRepository extends JpaRepository<TecnicaAluno, Long> {

    List<TecnicaAluno> findByAlunoIdOrderByAtualizadoEmDesc(Long alunoId);

    Optional<TecnicaAluno> findByAlunoIdAndTecnicaId(Long alunoId, Long tecnicaId);
}
