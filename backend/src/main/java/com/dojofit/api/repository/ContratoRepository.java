package com.dojofit.api.repository;

import com.dojofit.api.model.Contrato;
import com.dojofit.api.model.enums.StatusContrato;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContratoRepository extends JpaRepository<Contrato, Long> {

    Optional<Contrato> findByAlunoIdAndStatus(Long alunoId, StatusContrato status);

    List<Contrato> findByAlunoId(Long alunoId);
}
