package com.dojofit.api.repository;

import com.dojofit.api.model.Aviso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AvisoRepository extends JpaRepository<Aviso, Long> {

    List<Aviso> findAllByOrderByCriadoEmDesc();
}
