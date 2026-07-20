-- Notificação in-app (docs/06 passo 8, Fase 3a). Subsistema mínimo, genérico o
-- suficiente para outros tipos em fases futuras.
CREATE TABLE notificacao (
    id            BIGSERIAL PRIMARY KEY,
    usuario_id    BIGINT NOT NULL REFERENCES usuario(id),
    tipo          VARCHAR(30) NOT NULL,
    titulo        VARCHAR(150) NOT NULL,
    mensagem      TEXT NOT NULL,
    lida          BOOLEAN NOT NULL DEFAULT FALSE,
    referencia_id BIGINT,
    criado_em     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notificacao_usuario ON notificacao(usuario_id, lida);
