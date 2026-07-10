package com.dojofit.api.repository;

import com.dojofit.api.model.Usuario;
import com.dojofit.api.model.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByGoogleId(String googleId);

    List<Usuario> findByRole(Role role);

    List<Usuario> findByAtivoTrue();
}
