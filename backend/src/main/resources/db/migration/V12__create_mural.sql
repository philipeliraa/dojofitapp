-- Mural interno (docs/02 §4, docs/09 §4 — Fase 2): avisos da academia e o
-- feedback do aluno em resposta. Feedback é privado (regra de visibilidade no
-- FeedbackAvisoService). Sem alcance entre academias nesta fase.
CREATE TABLE aviso (
    id          BIGSERIAL PRIMARY KEY,
    titulo      VARCHAR(150) NOT NULL,
    conteudo    TEXT NOT NULL,
    autor_id    BIGINT NOT NULL REFERENCES usuario(id),
    criado_em   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_aviso_criado_em ON aviso(criado_em DESC);

CREATE TABLE feedback_aviso (
    id          BIGSERIAL PRIMARY KEY,
    aviso_id    BIGINT NOT NULL REFERENCES aviso(id),
    autor_id    BIGINT NOT NULL REFERENCES usuario(id),
    conteudo    TEXT NOT NULL,
    criado_em   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedback_aviso_aviso ON feedback_aviso(aviso_id);
CREATE INDEX idx_feedback_aviso_autor ON feedback_aviso(autor_id);
