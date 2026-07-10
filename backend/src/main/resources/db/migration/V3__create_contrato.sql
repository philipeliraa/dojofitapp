CREATE TABLE contrato (
    id              BIGSERIAL PRIMARY KEY,
    aluno_id        BIGINT NOT NULL REFERENCES usuario(id),
    plano_id        BIGINT NOT NULL REFERENCES plano(id),
    data_inicio     DATE NOT NULL,
    data_validade   DATE NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'ATIVO'
);

CREATE INDEX idx_contrato_aluno ON contrato(aluno_id);
CREATE INDEX idx_contrato_status ON contrato(status);
