package com.dojofit.api.repository;

import com.dojofit.api.model.FeedbackAviso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackAvisoRepository extends JpaRepository<FeedbackAviso, Long> {

    List<FeedbackAviso> findByAvisoIdOrderByCriadoEmAsc(Long avisoId);

    List<FeedbackAviso> findByAvisoIdAndAutorIdOrderByCriadoEmAsc(Long avisoId, Long autorId);

    void deleteByAvisoId(Long avisoId);
}
