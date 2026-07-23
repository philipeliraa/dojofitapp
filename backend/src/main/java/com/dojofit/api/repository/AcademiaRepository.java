package com.dojofit.api.repository;

import com.dojofit.api.model.Academia;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AcademiaRepository extends JpaRepository<Academia, Long> {
}
