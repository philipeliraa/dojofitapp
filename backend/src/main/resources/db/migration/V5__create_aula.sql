CREATE TABLE aula (
    id                  BIGSERIAL PRIMARY KEY,
    turma_id            BIGINT REFERENCES turma(id),
    data                DATE NOT NULL,
    hora_inicio         TIME NOT NULL,
    hora_fim            TIME NOT NULL,
    capacidade_maxima   INTEGER,
    professor_id        BIGINT NOT NULL REFERENCES usuario(id),
    cancelada           BOOLEAN NOT NULL DEFAULT FALSE,
    observacao          TEXT
);

CREATE INDEX idx_aula_data ON aula(data);
CREATE INDEX idx_aula_turma_data ON aula(turma_id, data);
