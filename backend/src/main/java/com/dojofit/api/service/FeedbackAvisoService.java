package com.dojofit.api.service;

import com.dojofit.api.dto.request.FeedbackAvisoRequest;
import com.dojofit.api.dto.response.FeedbackAvisoResponse;
import com.dojofit.api.model.Aviso;
import com.dojofit.api.model.FeedbackAviso;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.model.enums.Role;
import com.dojofit.api.repository.AvisoRepository;
import com.dojofit.api.repository.FeedbackAvisoRepository;
import com.dojofit.api.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Feedback do aluno em um aviso (docs/02 §4, Fase 2). Regra de privacidade
 * (decisão de produto desta fase): feedback é privado — o aluno vê só os
 * próprios; Professor/Admin vê todos. Moderação básica: autor apaga o próprio,
 * Professor/Admin apaga qualquer um.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FeedbackAvisoService {

    private final FeedbackAvisoRepository feedbackAvisoRepository;
    private final AvisoRepository avisoRepository;
    private final UsuarioRepository usuarioRepository;

    /** Feedbacks de um aviso já filtrados pela visibilidade de quem consulta. */
    public List<FeedbackAvisoResponse> listarVisiveis(Long avisoId, Usuario solicitante) {
        var feedbacks = ehEquipe(solicitante)
                ? feedbackAvisoRepository.findByAvisoIdOrderByCriadoEmAsc(avisoId)
                : feedbackAvisoRepository.findByAvisoIdAndAutorIdOrderByCriadoEmAsc(avisoId, solicitante.getId());
        return feedbacks.stream().map(FeedbackAvisoResponse::from).toList();
    }

    @Transactional
    public FeedbackAvisoResponse adicionar(Long avisoId, Long autorId, FeedbackAvisoRequest request) {
        Aviso aviso = avisoRepository.findById(avisoId)
                .orElseThrow(() -> new EntityNotFoundException("Aviso nao encontrado"));
        Usuario autor = usuarioRepository.findById(autorId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario nao encontrado"));

        var feedback = new FeedbackAviso();
        feedback.setAviso(aviso);
        feedback.setAutor(autor);
        feedback.setConteudo(request.conteudo());
        return FeedbackAvisoResponse.from(feedbackAvisoRepository.save(feedback));
    }

    @Transactional
    public void deletar(Long avisoId, Long feedbackId, Long solicitanteId) {
        FeedbackAviso feedback = feedbackAvisoRepository.findById(feedbackId)
                .orElseThrow(() -> new EntityNotFoundException("Feedback nao encontrado"));

        if (!feedback.getAviso().getId().equals(avisoId)) {
            throw new EntityNotFoundException("Feedback nao encontrado");
        }

        Usuario solicitante = usuarioRepository.findById(solicitanteId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario nao encontrado"));

        boolean ehAutor = feedback.getAutor().getId().equals(solicitanteId);
        if (!ehAutor && !ehEquipe(solicitante)) {
            throw new AccessDeniedException("Voce nao pode remover este feedback");
        }

        feedbackAvisoRepository.delete(feedback);
    }

    private boolean ehEquipe(Usuario usuario) {
        return usuario.getRole() == Role.PROFESSOR || usuario.getRole() == Role.ADMIN;
    }
}
