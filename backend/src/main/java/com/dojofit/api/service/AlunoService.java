package com.dojofit.api.service;

import com.dojofit.api.dto.response.AlunoDetalheResponse;
import com.dojofit.api.dto.response.AlunoResumoResponse;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.model.enums.Role;
import com.dojofit.api.repository.CheckinRepository;
import com.dojofit.api.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Visão de coaching dos alunos (docs/02 §2: Professor tem acesso de leitura a
 * Alunos). Read-only — a criação/edição de usuários fica na área de Admin
 * (AdminUsuarioController). Base para o fluxo de graduação (docs/06 fluxo 3).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AlunoService {

    private final UsuarioRepository usuarioRepository;
    private final CheckinRepository checkinRepository;

    public List<AlunoResumoResponse> listar() {
        return usuarioRepository.findByRole(Role.ALUNO).stream()
                .filter(Usuario::getAtivo)
                .map(AlunoResumoResponse::from)
                .toList();
    }

    public AlunoDetalheResponse detalhe(Long id) {
        Usuario aluno = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Aluno nao encontrado"));
        long totalCheckins = checkinRepository.countByAlunoId(id);
        return AlunoDetalheResponse.from(aluno, totalCheckins);
    }
}
