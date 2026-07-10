CREATE TABLE turma (
    id                  BIGSERIAL PRIMARY KEY,
    nome                VARCHAR(100) NOT NULL,
    dia_semana          VARCHAR(3) NOT NULL,
    hora_inicio         TIME NOT NULL,
    hora_fim            TIME NOT NULL,
    capacidade_maxima   INTEGER NOT NULL,
    professor_id        BIGINT NOT NULL REFERENCES usuario(id),
    ativo               BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_turma_dia ON turma(dia_semana);
