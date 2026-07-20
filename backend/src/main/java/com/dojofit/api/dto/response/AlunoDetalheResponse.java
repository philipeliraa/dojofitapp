package com.dojofit.api.dto.response;

import com.dojofit.api.model.Usuario;

/**
 * Cabeçalho do detalhe do aluno na área de coaching (docs/06 passo 2:
 * frequência + tempo na faixa). Técnicas (passo 2 também) são Fase 3b — fora
 * de escopo aqui.
 */
public record AlunoDetalheResponse(Long id, String nome, String email, long totalCheckins) {
    public static AlunoDetalheResponse from(Usuario u, long totalCheckins) {
        return new AlunoDetalheResponse(u.getId(), u.getNome(), u.getEmail(), totalCheckins);
    }
}
