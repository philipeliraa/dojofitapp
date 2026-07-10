CREATE TABLE checkin (
    id                  BIGSERIAL PRIMARY KEY,
    aula_id             BIGINT NOT NULL REFERENCES aula(id),
    aluno_id            BIGINT NOT NULL REFERENCES usuario(id),
    data_hora_checkin   TIMESTAMP NOT NULL DEFAULT NOW(),
    tipo                VARCHAR(20) NOT NULL,
    status              VARCHAR(30) NOT NULL,
    CONSTRAINT uk_checkin_aula_aluno UNIQUE (aula_id, aluno_id)
);

CREATE INDEX idx_checkin_aluno ON checkin(aluno_id);
CREATE INDEX idx_checkin_aula ON checkin(aula_id);
