package com.dojofit.api.service;

import com.dojofit.api.dto.response.NotificacaoResponse;
import com.dojofit.api.model.Notificacao;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.model.enums.TipoNotificacao;
import com.dojofit.api.repository.NotificacaoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Notificações in-app (docs/06 passo 8). Cada usuário só acessa as próprias —
 * a autorização é por posse (findByIdAndUsuarioId), não por papel.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificacaoService {

    private final NotificacaoRepository notificacaoRepository;

    @Transactional
    public void criar(Usuario destinatario, TipoNotificacao tipo, String titulo, String mensagem, Long referenciaId) {
        var notificacao = new Notificacao();
        notificacao.setUsuario(destinatario);
        notificacao.setTipo(tipo);
        notificacao.setTitulo(titulo);
        notificacao.setMensagem(mensagem);
        notificacao.setReferenciaId(referenciaId);
        notificacaoRepository.save(notificacao);
    }

    public List<NotificacaoResponse> listar(Long usuarioId) {
        return notificacaoRepository.findByUsuarioIdOrderByCriadoEmDesc(usuarioId).stream()
                .map(NotificacaoResponse::from)
                .toList();
    }

    public long contarNaoLidas(Long usuarioId) {
        return notificacaoRepository.countByUsuarioIdAndLidaFalse(usuarioId);
    }

    @Transactional
    public void marcarLida(Long id, Long usuarioId) {
        Notificacao notificacao = notificacaoRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Notificacao nao encontrada"));
        notificacao.setLida(true);
        notificacaoRepository.save(notificacao);
    }
}
