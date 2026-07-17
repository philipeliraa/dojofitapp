-- Convite de acesso (docs/02 seção 5, docs/06 fluxo 2): o papel do usuário é
-- sempre definido pela academia no convite — nunca autodeclarado no cadastro.
CREATE TABLE convite (
    id             BIGSERIAL PRIMARY KEY,
    token          UUID NOT NULL UNIQUE,
    email          VARCHAR(255) NOT NULL,
    role           VARCHAR(20) NOT NULL,
    criado_por_id  BIGINT NOT NULL REFERENCES usuario(id),
    criado_em      TIMESTAMP NOT NULL DEFAULT NOW(),
    expira_em      TIMESTAMP NOT NULL,
    usado_em       TIMESTAMP
);

CREATE INDEX idx_convite_email ON convite(email);
