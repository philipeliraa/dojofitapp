package com.dojofit.api.service;

import com.dojofit.api.dto.request.AvisoRequest;
import com.dojofit.api.dto.response.AvisoResponse;
import com.dojofit.api.model.Aviso;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.repository.AvisoRepository;
import com.dojofit.api.repository.FeedbackAvisoRepository;
import com.dojofit.api.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Mural — avisos da academia (docs/02 §4, Fase 2). Feed visível a todos os
 * papéis; publicação e remoção restritas a Professor/Admin (garantido por
 * {@code @PreAuthorize} no controller). Cada aviso já carrega os feedbacks
 * visíveis a quem consulta, delegando a regra de privacidade ao
 * {@link FeedbackAvisoService}.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AvisoService {

    private final AvisoRepository avisoRepository;
    private final FeedbackAvisoRepository feedbackAvisoRepository;
    private final FeedbackAvisoService feedbackAvisoService;
    private final UsuarioRepository usuarioRepository;

    public List<AvisoResponse> listar(Long solicitanteId) {
        Usuario solicitante = usuarioRepository.findById(solicitanteId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario nao encontrado"));

        return avisoRepository.findAllByOrderByCriadoEmDesc().stream()
                .map(aviso -> AvisoResponse.from(aviso, feedbackAvisoService.listarVisiveis(aviso.getId(), solicitante)))
                .toList();
    }

    @Transactional
    public AvisoResponse criar(AvisoRequest request, Long autorId) {
        Usuario autor = usuarioRepository.findById(autorId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario nao encontrado"));

        var aviso = new Aviso();
        aviso.setTitulo(request.titulo());
        aviso.setConteudo(request.conteudo());
        aviso.setAutor(autor);
        return AvisoResponse.from(avisoRepository.save(aviso), List.of());
    }

    @Transactional
    public void deletar(Long id) {
        Aviso aviso = avisoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Aviso nao encontrado"));

        // Remove os feedbacks associados antes do aviso (integridade referencial)
        feedbackAvisoRepository.deleteByAvisoId(id);
        avisoRepository.delete(aviso);
    }
}
