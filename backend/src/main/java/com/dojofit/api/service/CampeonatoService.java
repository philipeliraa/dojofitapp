package com.dojofit.api.service;

import com.dojofit.api.dto.request.CampeonatoRequest;
import com.dojofit.api.dto.response.CampeonatoResponse;
import com.dojofit.api.model.Campeonato;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.repository.CampeonatoRepository;
import com.dojofit.api.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Campeonatos e medalhas do aluno (docs/09 §7). Registro pela equipe
 * (garantido por @PreAuthorize no controller); o aluno apenas lê a própria
 * linha do tempo. Cada campeonato é um evento permanente (docs/01).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CampeonatoService {

    private final CampeonatoRepository campeonatoRepository;
    private final UsuarioRepository usuarioRepository;

    public List<CampeonatoResponse> listarDoAluno(Long alunoId) {
        return campeonatoRepository.findByAlunoIdOrderByDataDesc(alunoId).stream()
                .map(CampeonatoResponse::from)
                .toList();
    }

    @Transactional
    public CampeonatoResponse registrar(Long alunoId, CampeonatoRequest request, Long registradoPorId) {
        Usuario aluno = usuarioRepository.findById(alunoId)
                .orElseThrow(() -> new EntityNotFoundException("Aluno nao encontrado"));
        Usuario registradoPor = usuarioRepository.findById(registradoPorId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario nao encontrado"));

        var campeonato = new Campeonato();
        campeonato.setAluno(aluno);
        campeonato.setRegistradoPor(registradoPor);
        aplicar(campeonato, request);
        return CampeonatoResponse.from(campeonatoRepository.save(campeonato));
    }

    @Transactional
    public CampeonatoResponse atualizar(Long alunoId, Long campeonatoId, CampeonatoRequest request) {
        Campeonato campeonato = buscarDoAluno(alunoId, campeonatoId);
        aplicar(campeonato, request);
        return CampeonatoResponse.from(campeonatoRepository.save(campeonato));
    }

    @Transactional
    public void remover(Long alunoId, Long campeonatoId) {
        campeonatoRepository.delete(buscarDoAluno(alunoId, campeonatoId));
    }

    private Campeonato buscarDoAluno(Long alunoId, Long campeonatoId) {
        Campeonato campeonato = campeonatoRepository.findById(campeonatoId)
                .orElseThrow(() -> new EntityNotFoundException("Campeonato nao encontrado"));
        // Consistência do path: o campeonato tem que ser do aluno da URL
        if (!campeonato.getAluno().getId().equals(alunoId)) {
            throw new EntityNotFoundException("Campeonato nao encontrado");
        }
        return campeonato;
    }

    private void aplicar(Campeonato campeonato, CampeonatoRequest request) {
        campeonato.setNome(request.nome());
        campeonato.setData(request.data());
        campeonato.setResultado(request.resultado());
        campeonato.setCategoria(request.categoria());
        campeonato.setObservacao(request.observacao());
    }
}
