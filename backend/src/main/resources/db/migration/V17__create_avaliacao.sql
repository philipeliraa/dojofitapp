-- Avaliacao/observacao/recomendacao do professor (docs/09 §8, Fase 3d).
-- Escrito pela equipe. Visibilidade por registro: privado por padrao; publico
-- fica visivel ao aluno no Perfil (ex: recomendacoes de melhoria).
CREATE TABLE avaliacao (
    id          BIGSERIAL PRIMARY KEY,
    aluno_id    BIGINT NOT NULL REFERENCES usuario(id),
    tipo        VARCHAR(20) NOT NULL,
    conteudo    TEXT NOT NULL,
    publico     BOOLEAN NOT NULL DEFAULT FALSE,
    autor_id    BIGINT NOT NULL REFERENCES usuario(id),
    criado_em   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_avaliacao_aluno ON avaliacao(aluno_id, criado_em DESC);
