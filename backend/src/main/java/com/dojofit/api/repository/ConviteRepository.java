package com.dojofit.api.repository;

import com.dojofit.api.model.Convite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConviteRepository extends JpaRepository<Convite, Long> {

    Optional<Convite> findByToken(UUID token);

    Optional<Convite> findFirstByEmailIgnoreCaseAndUsadoEmIsNullAndExpiraEmAfterOrderByCriadoEmDesc(
            String email, LocalDateTime now);

    List<Convite> findByUsadoEmIsNullAndExpiraEmAfterOrderByCriadoEmDesc(LocalDateTime now);
}
