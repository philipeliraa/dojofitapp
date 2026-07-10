CREATE TABLE plano (
    id               BIGSERIAL PRIMARY KEY,
    nome             VARCHAR(100) NOT NULL,
    limite_semanal   INTEGER,
    ativo            BOOLEAN NOT NULL DEFAULT TRUE
);
