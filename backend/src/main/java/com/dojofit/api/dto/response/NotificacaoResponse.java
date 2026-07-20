package com.dojofit.api.dto.response;

import com.dojofit.api.model.Notificacao;
import com.dojofit.api.model.enums.TipoNotificacao;

import java.time.LocalDateTime;

public record NotificacaoResponse(
        Long id,
        TipoNotificacao tipo,
        String titulo,
        String mensagem,
        Boolean lida,
        Long referenciaId,
        LocalDateTime criadoEm
) {
    public static NotificacaoResponse from(Notificacao n) {
        return new NotificacaoResponse(
                n.getId(),
                n.getTipo(),
                n.getTitulo(),
                n.getMensagem(),
                n.getLida(),
                n.getReferenciaId(),
                n.getCriadoEm()
        );
    }
}
