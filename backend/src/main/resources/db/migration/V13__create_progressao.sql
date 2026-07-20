-- Progressão de faixa/grau (docs/02, docs/06, docs/09 §5 — Fase 3a). Modelo
-- multi-modalidade: a sequência de faixas é dado por modalidade, não enum
-- hardcoded. Cores presas aos 5 tokens belt.* de docs/03.
CREATE TABLE modalidade (
    id     BIGSERIAL PRIMARY KEY,
    nome   VARCHAR(100) NOT NULL,
    ativo  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE faixa (
    id            BIGSERIAL PRIMARY KEY,
    modalidade_id BIGINT NOT NULL REFERENCES modalidade(id),
    nome          VARCHAR(50) NOT NULL,
    cor           VARCHAR(20) NOT NULL,
    ordem         INT NOT NULL,
    graus_max     INT NOT NULL
);

CREATE INDEX idx_faixa_modalidade ON faixa(modalidade_id);

CREATE TABLE graduacao (
    id               BIGSERIAL PRIMARY KEY,
    aluno_id         BIGINT NOT NULL REFERENCES usuario(id),
    modalidade_id    BIGINT NOT NULL REFERENCES modalidade(id),
    faixa_id         BIGINT NOT NULL REFERENCES faixa(id),
    grau             INT NOT NULL,
    data             DATE NOT NULL,
    observacao       TEXT,
    concedida_por_id BIGINT NOT NULL REFERENCES usuario(id),
    criado_em        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_graduacao_aluno ON graduacao(aluno_id);
CREATE INDEX idx_graduacao_aluno_modalidade ON graduacao(aluno_id, modalidade_id);

-- Seed: Jiu-Jitsu com a progressão adulta (branca -> preta). Faixas coloridas
-- com até 4 graus; preta com até 6. Dado configurável (docs/09 §5).
INSERT INTO modalidade (nome, ativo) VALUES ('Jiu-Jitsu', TRUE);

INSERT INTO faixa (modalidade_id, nome, cor, ordem, graus_max)
SELECT m.id, v.nome, v.cor, v.ordem, v.graus_max
FROM modalidade m,
     (VALUES
        ('Branca', 'BRANCA', 1, 4),
        ('Azul',   'AZUL',   2, 4),
        ('Roxa',   'ROXA',   3, 4),
        ('Marrom', 'MARROM', 4, 4),
        ('Preta',  'PRETA',  5, 6)
     ) AS v(nome, cor, ordem, graus_max)
WHERE m.nome = 'Jiu-Jitsu';
