package com.dojofit.api.service;

import com.dojofit.api.dto.request.AvaliacaoRequest;
import com.dojofit.api.dto.response.AvaliacaoResponse;
import com.dojofit.api.model.Avaliacao;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.repository.AvaliacaoRepository;
import com.dojofit.api.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Avaliações do professor (docs/09 §8). Escrita pela equipe. Visibilidade por
 * registro: {@code listarDoAluno} (equipe) traz todas; {@code listarPublicas}
 * (usada pela rota /eu) traz só as marcadas como públicas — a nota privada
 * nunca chega ao aluno.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final UsuarioRepository usuarioRepository;

    /** Todas as avaliações do aluno — visão da equipe (Gestão → Alunos). */
    public List<AvaliacaoResponse> listarDoAluno(Long alunoId) {
        return avaliacaoRepository.findByAlunoIdOrderByCriadoEmDesc(alunoId).stream()
                .map(AvaliacaoResponse::from)
                .toList();
    }

    /** Só as públicas — visão do próprio aluno (Perfil). */
    public List<AvaliacaoResponse> listarPublicasDoAluno(Long alunoId) {
        return avaliacaoRepository.findByAlunoIdAndPublicoTrueOrderByCriadoEmDesc(alunoId).stream()
                .map(AvaliacaoResponse::from)
                .toList();
    }

    @Transactional
    public AvaliacaoResponse registrar(Long alunoId, AvaliacaoRequest request, Long autorId) {
        Usuario aluno = usuarioRepository.findById(alunoId)
                .orElseThrow(() -> new EntityNotFoundException("Aluno nao encontrado"));
        Usuario autor = usuarioRepository.findById(autorId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario nao encontrado"));

        var avaliacao = new Avaliacao();
        avaliacao.setAluno(aluno);
        avaliacao.setAutor(autor);
        aplicar(avaliacao, request);
        return AvaliacaoResponse.from(avaliacaoRepository.save(avaliacao));
    }

    @Transactional
    public AvaliacaoResponse atualizar(Long alunoId, Long avaliacaoId, AvaliacaoRequest request) {
        Avaliacao avaliacao = buscarDoAluno(alunoId, avaliacaoId);
        aplicar(avaliacao, request);
        return AvaliacaoResponse.from(avaliacaoRepository.save(avaliacao));
    }

    @Transactional
    public void remover(Long alunoId, Long avaliacaoId) {
        avaliacaoRepository.delete(buscarDoAluno(alunoId, avaliacaoId));
    }

    private Avaliacao buscarDoAluno(Long alunoId, Long avaliacaoId) {
        Avaliacao avaliacao = avaliacaoRepository.findById(avaliacaoId)
                .orElseThrow(() -> new EntityNotFoundException("Avaliacao nao encontrada"));
        // Consistência do path: a avaliação tem que ser do aluno da URL
        if (!avaliacao.getAluno().getId().equals(alunoId)) {
            throw new EntityNotFoundException("Avaliacao nao encontrada");
        }
        return avaliacao;
    }

    private void aplicar(Avaliacao avaliacao, AvaliacaoRequest request) {
        avaliacao.setTipo(request.tipo());
        avaliacao.setConteudo(request.conteudo());
        avaliacao.setPublico(request.publico());
    }
}
