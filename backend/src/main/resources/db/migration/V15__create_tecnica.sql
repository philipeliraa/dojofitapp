-- Técnicas (docs/09 §6, Fase 3b): catálogo por modalidade + status por aluno
-- (dominada / em desenvolvimento). Avaliação de coaching — quem define é a
-- equipe. Configurável por dados, como a progressão de faixas (docs/09 §5).
CREATE TABLE tecnica (
    id            BIGSERIAL PRIMARY KEY,
    modalidade_id BIGINT NOT NULL REFERENCES modalidade(id),
    nome          VARCHAR(100) NOT NULL,
    descricao     TEXT,
    ativo         BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_tecnica_modalidade ON tecnica(modalidade_id);

CREATE TABLE tecnica_aluno (
    id              BIGSERIAL PRIMARY KEY,
    aluno_id        BIGINT NOT NULL REFERENCES usuario(id),
    tecnica_id      BIGINT NOT NULL REFERENCES tecnica(id),
    status          VARCHAR(20) NOT NULL,
    avaliado_por_id BIGINT NOT NULL REFERENCES usuario(id),
    atualizado_em   TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_tecnica_aluno UNIQUE (aluno_id, tecnica_id)
);

CREATE INDEX idx_tecnica_aluno_aluno ON tecnica_aluno(aluno_id);

-- Seed de um catálogo inicial de jiu-jitsu, para nascer útil.
INSERT INTO tecnica (modalidade_id, nome)
SELECT m.id, v.nome
FROM modalidade m,
     (VALUES
        ('Armlock'),
        ('Triângulo'),
        ('Kimura'),
        ('Mata-leão'),
        ('Raspagem de gancho'),
        ('Passagem de guarda'),
        ('Montada'),
        ('Pegada nas costas')
     ) AS v(nome)
WHERE m.nome = 'Jiu-Jitsu';
