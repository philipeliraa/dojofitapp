CREATE TABLE lista_espera (
    id                  BIGSERIAL PRIMARY KEY,
    aula_id             BIGINT NOT NULL REFERENCES aula(id),
    aluno_id            BIGINT NOT NULL REFERENCES usuario(id),
    posicao             INTEGER NOT NULL,
    data_hora_entrada   TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_lista_espera_aula_aluno UNIQUE (aula_id, aluno_id)
);

CREATE INDEX idx_lista_espera_aula ON lista_espera(aula_id);
