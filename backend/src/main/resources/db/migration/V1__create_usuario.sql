CREATE TABLE usuario (
    id          BIGSERIAL PRIMARY KEY,
    nome        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    senha_hash  VARCHAR(255),
    google_id   VARCHAR(255) UNIQUE,
    role        VARCHAR(20) NOT NULL DEFAULT 'ALUNO',
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_role ON usuario(role);
